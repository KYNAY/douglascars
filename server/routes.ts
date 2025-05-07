import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  brands, vehicles, dealers, sales, reviews, instagramPosts, vehicleImages,
  evaluationRequests, financingRequests, evaluationStatusEnum, financingStatusEnum,
  heroSlides, heroSlidesInsertSchema
} from "@shared/schema";
import { eq, and, not, desc, asc, like, or, gte, lte, count, sql } from "drizzle-orm";
import { SQL } from "drizzle-orm";
import * as crypto from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";
  
  // Healthcheck routes
  app.get(`${apiPrefix}/health`, (_req, res) => {
    return res.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Rota de healthcheck para o EasyPanel
  app.get("/health", (_req, res) => {
    return res.json({ status: "ok" });
  });
  
  // Função para verificar se existem reservas expiradas e liberá-las
  async function checkAndReleaseExpiredReservations() {
    try {
      const now = new Date();
      // Buscar veículos com reservas expiradas
      const expiredReservations = await db.select()
        .from(vehicles)
        .where(
          and(
            eq(vehicles.reserved, true),
            not(eq(vehicles.reservationExpiresAt, null)),
            lte(vehicles.reservationExpiresAt, now)
          )
        );
      
      if (expiredReservations.length > 0) {
        // Liberar cada reserva expirada
        for (const vehicle of expiredReservations) {
          await db.update(vehicles)
            .set({
              reserved: false,
              reservedBy: null,
              reservationTime: null,
              reservationExpiresAt: null
            })
            .where(eq(vehicles.id, vehicle.id));
            
          console.log(`Reserva do veículo ID ${vehicle.id} foi liberada automaticamente por expiração.`);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar reservas expiradas:", error);
    }
  }
  
  // Verificar reservas expiradas a cada 5 minutos
  setInterval(checkAndReleaseExpiredReservations, 5 * 60 * 1000);

  // Brands routes
  app.get(`${apiPrefix}/brands`, async (req, res) => {
    try {
      const allBrands = await db.select().from(brands).orderBy(asc(brands.name));
      return res.json(allBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      return res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  // Obter marca específica
  app.get(`${apiPrefix}/brands/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const brand = await db.select().from(brands).where(eq(brands.id, Number(id))).limit(1);
      
      if (!brand.length) {
        return res.status(404).json({ error: "Brand not found" });
      }
      
      return res.json(brand[0]);
    } catch (error) {
      console.error("Error fetching brand:", error);
      return res.status(500).json({ error: "Failed to fetch brand" });
    }
  });

  // Adicionar marca
  app.post(`${apiPrefix}/brands`, async (req, res) => {
    try {
      const { name, logoUrl } = req.body;
      
      // Validar dados da marca
      if (!name) {
        return res.status(400).json({ error: "Brand name is required" });
      }

      // Verificar se já existe uma marca com o mesmo nome
      const existingBrand = await db.select().from(brands).where(eq(brands.name, name)).limit(1);
      if (existingBrand.length) {
        return res.status(409).json({ error: "A brand with this name already exists" });
      }

      const [newBrand] = await db.insert(brands).values({
        name,
        logoUrl: logoUrl || ""
      }).returning();

      return res.status(201).json(newBrand);
    } catch (error) {
      console.error("Error creating brand:", error);
      return res.status(500).json({ error: "Failed to create brand" });
    }
  });

  // Atualizar marca
  app.put(`${apiPrefix}/brands/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, logoUrl } = req.body;
      
      // Validar dados da marca
      if (!name) {
        return res.status(400).json({ error: "Brand name is required" });
      }

      // Verificar se a marca existe
      const existingBrand = await db.select().from(brands).where(eq(brands.id, Number(id))).limit(1);
      if (!existingBrand.length) {
        return res.status(404).json({ error: "Brand not found" });
      }

      // Verificar se já existe outra marca com o mesmo nome
      const brandWithSameName = await db.select()
        .from(brands)
        .where(and(
          eq(brands.name, name),
          not(eq(brands.id, Number(id)))
        ))
        .limit(1);
        
      if (brandWithSameName.length) {
        return res.status(409).json({ error: "Another brand with this name already exists" });
      }

      const [updatedBrand] = await db.update(brands)
        .set({
          name,
          logoUrl: logoUrl || ""
        })
        .where(eq(brands.id, Number(id)))
        .returning();

      return res.json(updatedBrand);
    } catch (error) {
      console.error("Error updating brand:", error);
      return res.status(500).json({ error: "Failed to update brand" });
    }
  });

  // Excluir marca
  app.delete(`${apiPrefix}/brands/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a marca existe
      const existingBrand = await db.select().from(brands).where(eq(brands.id, Number(id))).limit(1);
      if (!existingBrand.length) {
        return res.status(404).json({ error: "Brand not found" });
      }

      // Verificar se existem veículos vinculados a esta marca
      const relatedVehicles = await db.select({ count: count() }).from(vehicles).where(eq(vehicles.brandId, Number(id)));
      
      if (relatedVehicles[0].count > 0) {
        return res.status(409).json({ 
          error: "Cannot delete brand with associated vehicles", 
          count: relatedVehicles[0].count 
        });
      }

      await db.delete(brands).where(eq(brands.id, Number(id)));

      return res.json({ success: true, message: "Brand deleted successfully" });
    } catch (error) {
      console.error("Error deleting brand:", error);
      return res.status(500).json({ error: "Failed to delete brand" });
    }
  });

  // Vehicles routes
  app.get(`${apiPrefix}/vehicles`, async (req, res) => {
    try {
      const { 
        brandId, 
        search, 
        featured,
        specialFeatured,
        minPrice,
        maxPrice,
        transmission,
        fuel,
        bodyType,
        color,
        vehicleType
      } = req.query;
      
      let conditions: SQL[] = [];

      // Se não for especificado sold=true, filtrar apenas os não vendidos
      if (req.query.sold !== 'true') {
        conditions.push(not(eq(vehicles.sold, true)));
      } else if (req.query.sold === 'true') {
        conditions.push(eq(vehicles.sold, true));
      }
      
      if (brandId && brandId !== 'all') {
        conditions.push(eq(vehicles.brandId, Number(brandId)));
      }
      
      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          or(
            like(vehicles.model, searchTerm),
            sql`${vehicles.description} LIKE ${searchTerm}`
          )
        );
      }
      
      if (featured === 'true') {
        conditions.push(eq(vehicles.featured, true));
      }

      if (specialFeatured === 'true') {
        conditions.push(eq(vehicles.specialFeatured, true));
      }
      
      // Filtro por tipo de veículo (carro ou moto)
      if (vehicleType) {
        conditions.push(eq(vehicles.vehicleType, String(vehicleType)));
      }
      
      // Filtro de preço
      if (minPrice) {
        conditions.push(
          gte(sql`CAST(${vehicles.price} AS DECIMAL)`, Number(minPrice))
        );
      }
      
      if (maxPrice) {
        conditions.push(
          lte(sql`CAST(${vehicles.price} AS DECIMAL)`, Number(maxPrice))
        );
      }
      
      // Filtro de transmissão (pode ser múltiplo, vem como array)
      if (transmission) {
        const transmissionValues = Array.isArray(transmission) ? transmission : [transmission];
        if (transmissionValues.length > 0) {
          const transmissionConditions = transmissionValues.map(t => eq(vehicles.transmission, String(t)));
          if (transmissionConditions.length > 0) {
            conditions.push(or(...transmissionConditions));
          }
        }
      }
      
      // Filtro de combustível (pode ser múltiplo, vem como array)
      if (fuel) {
        const fuelValues = Array.isArray(fuel) ? fuel : [fuel];
        if (fuelValues.length > 0) {
          const fuelConditions = fuelValues.map(f => eq(vehicles.fuel, String(f)));
          if (fuelConditions.length > 0) {
            conditions.push(or(...fuelConditions));
          }
        }
      }
      
      // Filtro de tipo de carroceria (pode ser múltiplo, vem como array)
      if (bodyType) {
        const bodyTypeValues = Array.isArray(bodyType) ? bodyType : [bodyType];
        if (bodyTypeValues.length > 0) {
          const bodyTypeConditions = bodyTypeValues.map(b => eq(vehicles.bodyType, String(b)));
          if (bodyTypeConditions.length > 0) {
            conditions.push(or(...bodyTypeConditions));
          }
        }
      }
      
      // Filtro de cor (pode ser múltiplo, vem como array)
      if (color) {
        const colorValues = Array.isArray(color) ? color : [color];
        if (colorValues.length > 0) {
          const colorConditions = colorValues.map(c => eq(vehicles.color, String(c)));
          if (colorConditions.length > 0) {
            conditions.push(or(...colorConditions));
          }
        }
      }
      
      const result = await db.select()
        .from(vehicles)
        .where(and(...conditions))
        .orderBy(desc(vehicles.createdAt));
      
      // Fetch brand details and primary image for each vehicle
      const vehiclesWithBrands = await Promise.all(
        result.map(async (vehicle) => {
          const brand = await db.select().from(brands).where(eq(brands.id, vehicle.brandId)).limit(1);
          
          // Se o veículo não tiver imagem principal, tentar buscar a primeira imagem adicional
          let mainImage = vehicle.imageUrl;
          if (!mainImage || mainImage.trim() === "") {
            const images = await db.select()
              .from(vehicleImages)
              .where(eq(vehicleImages.vehicleId, vehicle.id))
              .orderBy(asc(vehicleImages.order))
              .limit(1);
              
            if (images.length > 0) {
              mainImage = images[0].imageUrl;
            }
          }
          
          return {
            ...vehicle,
            imageUrl: mainImage,
            brand: brand[0] || null
          };
        })
      );
      
      return res.json(vehiclesWithBrands);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      return res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get(`${apiPrefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      
      if (!vehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Buscar a marca
      const brand = await db.select().from(brands).where(eq(brands.id, vehicle[0].brandId)).limit(1);
      
      // Buscar todas as imagens adicionais
      const images = await db.select()
        .from(vehicleImages)
        .where(eq(vehicleImages.vehicleId, Number(id)))
        .orderBy(asc(vehicleImages.order));
      
      // Verificar se a imagem principal existe
      let mainImage = vehicle[0].imageUrl;
      if (!mainImage || mainImage.trim() === "") {
        if (images.length > 0) {
          mainImage = images[0].imageUrl;
          // Remover a primeira imagem da lista de imagens adicionais para evitar duplicação
          images.shift();
        }
      }
      
      return res.json({
        ...vehicle[0],
        imageUrl: mainImage,
        brand: brand[0] || null,
        additionalImages: images || []
      });
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  // Adicionar veículo
  app.post(`${apiPrefix}/vehicles`, async (req, res) => {
    try {
      const vehicleData = req.body;
      // Validar dados do veículo
      if (!vehicleData.model || !vehicleData.brandId || !vehicleData.year || !vehicleData.price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Converter para valores numéricos apropriados
      const brandId = Number(vehicleData.brandId);
      const mileage = vehicleData.mileage ? Number(vehicleData.mileage.toString().replace(/\./g, '').replace(',', '.')) : 0;
      
      // Processar valores monetários do formato brasileiro para o formato numérico do banco
      let price = vehicleData.price;
      if (typeof price === 'string') {
        // Remover pontos de milhar e substituir vírgula por ponto para casas decimais
        price = price.replace(/\./g, '').replace(',', '.');
      }
      
      let originalPrice = vehicleData.originalPrice;
      if (originalPrice && typeof originalPrice === 'string') {
        // Remover pontos de milhar e substituir vírgula por ponto para casas decimais
        originalPrice = originalPrice.replace(/\./g, '').replace(',', '.');
      }

      // Garantir que campos booleanos estejam corretos
      const featured = vehicleData.featured === true;
      const sold = vehicleData.sold === true;

      const [newVehicle] = await db.insert(vehicles).values({
        model: vehicleData.model,
        brandId,
        year: vehicleData.year,
        color: vehicleData.color || "",
        price: price.toString(),
        originalPrice: originalPrice ? originalPrice.toString() : null,
        mileage,
        description: vehicleData.description || null,
        featured,
        sold,
        imageUrl: vehicleData.imageUrl || "",
        transmission: vehicleData.transmission || null,
        fuel: vehicleData.fuel || null,
        bodyType: vehicleData.bodyType || null,
        vehicleType: vehicleData.vehicleType || "car"
      }).returning();

      return res.status(201).json(newVehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      return res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  // Atualizar veículo
  app.put(`${apiPrefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleData = req.body;
      
      // Verificar se o veículo existe
      const existingVehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      if (!existingVehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      // Converter para valores numéricos apropriados
      const brandId = Number(vehicleData.brandId);
      const mileage = vehicleData.mileage ? Number(vehicleData.mileage.toString().replace(/\./g, '').replace(',', '.')) : 0;
      
      // Processar valores monetários do formato brasileiro para o formato numérico do banco
      let price = vehicleData.price;
      if (typeof price === 'string') {
        // Remover pontos de milhar e substituir vírgula por ponto para casas decimais
        price = price.replace(/\./g, '').replace(',', '.');
      }
      
      let originalPrice = vehicleData.originalPrice;
      if (originalPrice && typeof originalPrice === 'string') {
        // Remover pontos de milhar e substituir vírgula por ponto para casas decimais
        originalPrice = originalPrice.replace(/\./g, '').replace(',', '.');
      }

      // Garantir que campos booleanos estejam corretos
      const featured = vehicleData.featured === true;
      const specialFeatured = vehicleData.specialFeatured === true;
      const sold = vehicleData.sold === true;

      const [updatedVehicle] = await db.update(vehicles)
        .set({
          model: vehicleData.model,
          brandId,
          year: vehicleData.year,
          color: vehicleData.color || "",
          price: price.toString(),
          originalPrice: originalPrice ? originalPrice.toString() : null,
          mileage,
          description: vehicleData.description || null,
          featured,
          specialFeatured,
          sold,
          imageUrl: vehicleData.imageUrl || "",
          transmission: vehicleData.transmission || null,
          fuel: vehicleData.fuel || null,
          bodyType: vehicleData.bodyType || null,
          vehicleType: vehicleData.vehicleType || "car"
        })
        .where(eq(vehicles.id, Number(id)))
        .returning();

      return res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      return res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  // Atualizar parcialmente veículo (PATCH)
  app.patch(`${apiPrefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Verificar se o veículo existe
      const existingVehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      if (!existingVehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      // Preparar os dados para atualização
      const dataToUpdate: any = {};
      
      // Campos booleanos
      if ('featured' in updateData) dataToUpdate.featured = updateData.featured === true;
      if ('specialFeatured' in updateData) dataToUpdate.specialFeatured = updateData.specialFeatured === true;
      if ('sold' in updateData) dataToUpdate.sold = updateData.sold === true;
      
      // Atualizar apenas os campos fornecidos
      const [updatedVehicle] = await db.update(vehicles)
        .set(dataToUpdate)
        .where(eq(vehicles.id, Number(id)))
        .returning();

      return res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      return res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  // Excluir veículo
  app.delete(`${apiPrefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o veículo existe
      const existingVehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      if (!existingVehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      await db.delete(vehicles).where(eq(vehicles.id, Number(id)));

      return res.json({ success: true, message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      return res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Dealer authentication
  app.post(`${apiPrefix}/auth/dealer/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
      }
      
      // Verificar se o vendedor existe por username ou email
      const dealer = await db.select()
        .from(dealers)
        .where(
          or(
            eq(dealers.username, username),
            eq(dealers.email, username)
          )
        )
        .limit(1);
        
      if (!dealer.length) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }
      
      // Verificar senha (em uma aplicação real deve-se usar bcrypt para comparar)
      if (dealer[0].password !== password) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }
      
      // Remover a senha dos dados do vendedor antes de enviar
      const { password: _, ...dealerWithoutPassword } = dealer[0];
      
      return res.json({
        success: true,
        dealer: dealerWithoutPassword,
        token: `dealer_${dealerWithoutPassword.id}_${Date.now()}` // Em produção, use JWT adequado
      });
    } catch (error) {
      console.error("Error authenticating dealer:", error);
      return res.status(500).json({ error: "Falha na autenticação" });
    }
  });
  
  // Dealer routes
  app.get(`${apiPrefix}/dealers/ranking`, async (req, res) => {
    try {
      const dealersRanking = await db.select().from(dealers).orderBy(desc(dealers.points));
      return res.json(dealersRanking);
    } catch (error) {
      console.error("Error fetching dealer rankings:", error);
      return res.status(500).json({ error: "Failed to fetch dealer rankings" });
    }
  });
  
  // Create new dealer
  app.post(`${apiPrefix}/dealers`, async (req, res) => {
    try {
      const dealerData = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email || null,
        startDate: new Date(),
        points: 0,
        sales: 0
      };
      
      // Verificar se o nome de usuário já existe
      const existingDealer = await db.select().from(dealers)
        .where(
          or(
            eq(dealers.username, dealerData.username),
            dealerData.email ? eq(dealers.email, dealerData.email) : undefined
          )
        )
        .limit(1);
        
      if (existingDealer.length > 0) {
        if (existingDealer[0].username === dealerData.username) {
          return res.status(400).json({ error: "Vendedor com este nome de usuário já existe" });
        } else if (dealerData.email && existingDealer[0].email === dealerData.email) {
          return res.status(400).json({ error: "Vendedor com este email já existe" });
        }
      }
      
      const [newDealer] = await db.insert(dealers).values(dealerData).returning();
      return res.status(201).json(newDealer);
    } catch (error) {
      console.error("Error creating dealer:", error);
      return res.status(500).json({ error: "Failed to create dealer" });
    }
  });
  
  // Endpoint de autenticação para o dealer (login) está definido acima, linha 449
  
  // Get dealer sales
  app.get(`${apiPrefix}/dealers/:id/sales`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o vendedor existe
      const dealer = await db.select().from(dealers).where(eq(dealers.id, Number(id))).limit(1);
      if (!dealer.length) {
        return res.status(404).json({ error: "Vendedor não encontrado" });
      }
      
      // Buscar as vendas deste vendedor com informações do veículo
      const dealerSales = await db.query.sales.findMany({
        where: eq(sales.dealerId, Number(id)),
        with: {
          vehicle: {
            with: {
              brand: true
            }
          }
        },
        orderBy: desc(sales.saleDate)
      });
      
      return res.json(dealerSales);
    } catch (error) {
      console.error("Error fetching dealer sales:", error);
      return res.status(500).json({ error: "Failed to fetch dealer sales" });
    }
  });
  
  // Update dealer credentials
  app.patch(`${apiPrefix}/dealers/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, username, email, password } = req.body;
      
      // Verificar se o vendedor existe
      const existingDealer = await db.select().from(dealers).where(eq(dealers.id, Number(id))).limit(1);
      if (!existingDealer.length) {
        return res.status(404).json({ error: "Vendedor não encontrado" });
      }
      
      // Verificar se o nome de usuário já existe (se estiver sendo alterado)
      if (username && username !== existingDealer[0].username) {
        const dealerWithUsername = await db.select()
          .from(dealers)
          .where(and(
            eq(dealers.username, username),
            not(eq(dealers.id, Number(id)))
          ))
          .limit(1);
          
        if (dealerWithUsername.length > 0) {
          return res.status(400).json({ error: "Já existe outro vendedor com este nome de usuário" });
        }
      }
      
      // Criar objeto com os campos para atualizar
      const updateData: any = {};
      
      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      
      // Atualizar vendedor
      const [updatedDealer] = await db.update(dealers)
        .set(updateData)
        .where(eq(dealers.id, Number(id)))
        .returning();
      
      return res.json(updatedDealer);
    } catch (error) {
      console.error("Error updating dealer:", error);
      return res.status(500).json({ error: "Failed to update dealer" });
    }
  });
  
  // Delete dealer
  app.delete(`${apiPrefix}/dealers/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if dealer exists
      const existingDealer = await db.select().from(dealers).where(eq(dealers.id, Number(id))).limit(1);
      if (!existingDealer.length) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      
      await db.delete(dealers).where(eq(dealers.id, Number(id)));
      return res.json({ success: true, message: "Dealer deleted successfully" });
    } catch (error) {
      console.error("Error deleting dealer:", error);
      return res.status(500).json({ error: "Failed to delete dealer" });
    }
  });
  
  // Delete dealer with all associated records (complete deletion)
  app.delete(`${apiPrefix}/dealers/:id/complete`, async (req, res) => {
    try {
      const { id } = req.params;
      const dealerId = Number(id);
      
      // Check if dealer exists
      const existingDealer = await db.select().from(dealers).where(eq(dealers.id, dealerId)).limit(1);
      if (!existingDealer.length) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      
      // First, get all sales from this dealer
      const dealerSales = await db.select().from(sales).where(eq(sales.dealerId, dealerId));
      
      // For each sale, update the vehicle to be available again
      for (const sale of dealerSales) {
        await db.update(vehicles)
          .set({ 
            sold: false,
            featured: true // Highlight the vehicle again
          })
          .where(eq(vehicles.id, sale.vehicleId));
      }
      
      // Delete all sales from this dealer
      await db.delete(sales).where(eq(sales.dealerId, dealerId));
      
      // Finally, delete the dealer
      await db.delete(dealers).where(eq(dealers.id, dealerId));
      
      return res.json({ 
        success: true, 
        message: "O vendedor e todas as suas vendas foram excluídos com sucesso. Os relatórios foram atualizados.",
        salesRemoved: dealerSales.length
      });
    } catch (error) {
      console.error("Error deleting dealer with all records:", error);
      return res.status(500).json({ error: "Falha ao excluir o vendedor e seus registros associados" });
    }
  });
  
  // Delete all dealers
  app.delete(`${apiPrefix}/dealers`, async (req, res) => {
    try {
      await db.delete(dealers);
      return res.json({ success: true, message: "All dealers deleted successfully" });
    } catch (error) {
      console.error("Error deleting all dealers:", error);
      return res.status(500).json({ error: "Failed to delete all dealers" });
    }
  });
  
  // Reserve vehicle for 24 hours
  app.post(`${apiPrefix}/vehicles/:id/reserve`, async (req, res) => {
    try {
      const { id } = req.params;
      const { dealerId } = req.body;
      
      if (!dealerId) {
        return res.status(400).json({ error: "Dealer ID is required" });
      }
      
      // Check if vehicle exists
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      
      if (!vehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      if (vehicle[0].sold) {
        return res.status(400).json({ error: "Vehicle is already sold" });
      }
      
      if (vehicle[0].reserved) {
        // Check if already reserved by this dealer
        if (vehicle[0].reservedBy === Number(dealerId)) {
          return res.status(400).json({ 
            error: "You have already reserved this vehicle",
            expiresAt: vehicle[0].reservationExpiresAt
          });
        }
        
        return res.status(400).json({ 
          error: "Vehicle is already reserved by another dealer",
          expiresAt: vehicle[0].reservationExpiresAt
        });
      }
      
      // Check if dealer exists
      const dealer = await db.select().from(dealers).where(eq(dealers.id, Number(dealerId))).limit(1);
      
      if (!dealer.length) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      
      // Create timestamps for reservation (now and expiration in 24h)
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Reserve the vehicle
      const [updatedVehicle] = await db.update(vehicles)
        .set({
          reserved: true,
          reservedBy: Number(dealerId),
          reservationTime: now,
          reservationExpiresAt: expiresAt
        })
        .where(eq(vehicles.id, Number(id)))
        .returning();
      
      return res.json({
        ...updatedVehicle,
        message: "Vehicle reserved successfully for 24 hours",
        expiresAt
      });
    } catch (error) {
      console.error("Error reserving vehicle:", error);
      return res.status(500).json({ error: "Failed to reserve vehicle" });
    }
  });
  
  // Cancel vehicle reservation
  app.post(`${apiPrefix}/vehicles/:id/cancel-reservation`, async (req, res) => {
    try {
      const { id } = req.params;
      const { dealerId } = req.body;
      
      if (!dealerId) {
        return res.status(400).json({ error: "Dealer ID is required" });
      }
      
      // Check if vehicle exists
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      
      if (!vehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      if (!vehicle[0].reserved) {
        return res.status(400).json({ error: "Vehicle is not reserved" });
      }
      
      if (vehicle[0].reservedBy !== Number(dealerId)) {
        return res.status(403).json({ error: "You are not authorized to cancel this reservation" });
      }
      
      // Cancel the reservation
      const [updatedVehicle] = await db.update(vehicles)
        .set({
          reserved: false,
          reservedBy: null,
          reservationTime: null,
          reservationExpiresAt: null
        })
        .where(eq(vehicles.id, Number(id)))
        .returning();
      
      return res.json({
        ...updatedVehicle,
        message: "Reservation cancelled successfully"
      });
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return res.status(500).json({ error: "Failed to cancel reservation" });
    }
  });

  // Mark vehicle as sold and assign to dealer
  app.patch(`${apiPrefix}/vehicles/:id/sold`, async (req, res) => {
    try {
      const { id } = req.params;
      const { dealerId, soldDate } = req.body;
      
      if (!dealerId) {
        return res.status(400).json({ error: "Dealer ID is required" });
      }
      
      // Check if vehicle exists and is not sold
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      if (!vehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      if (vehicle[0].sold) {
        return res.status(400).json({ error: "Vehicle is already sold" });
      }
      
      // Verificar se o veículo está reservado para outro vendedor
      if (vehicle[0].reserved && vehicle[0].reservedBy !== Number(dealerId)) {
        return res.status(403).json({ 
          error: "Vehicle is reserved by another dealer",
          expiresAt: vehicle[0].reservationExpiresAt
        });
      }
      
      // Check if dealer exists
      const dealer = await db.select().from(dealers).where(eq(dealers.id, dealerId)).limit(1);
      if (!dealer.length) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      
      // Update vehicle as sold and clear reservation data
      await db.update(vehicles)
        .set({ 
          sold: true,
          reserved: false,
          reservedBy: null,
          reservationTime: null,
          reservationExpiresAt: null
        })
        .where(eq(vehicles.id, Number(id)));
      
      // Record the sale
      const salePrice = typeof vehicle[0].price === 'string' 
        ? parseFloat(vehicle[0].price) 
        : vehicle[0].price;
        
      const [newSale] = await db.insert(sales).values({
        vehicleId: Number(id),
        dealerId: dealerId,
        salePrice: salePrice,
        saleDate: soldDate ? new Date(soldDate) : new Date(),
        pointsAwarded: 10  // Adicionando os pontos concedidos
      }).returning();
      
      // Update dealer points and sales count
      await db.update(dealers)
        .set({ 
          sales: dealer[0].sales + 1,
          points: dealer[0].points + 10 // 10 points per sale
        })
        .where(eq(dealers.id, dealerId));
      
      return res.status(201).json({
        success: true,
        sale: newSale
      });
    } catch (error) {
      console.error("Error marking vehicle as sold:", error);
      return res.status(500).json({ error: "Failed to mark vehicle as sold" });
    }
  });

  // Record a sale
  app.post(`${apiPrefix}/sales`, async (req, res) => {
    try {
      const { vehicleId, dealerId, salePrice, pointsAwarded } = req.body;
      
      // Verify vehicle exists and is not sold
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
      if (!vehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      if (vehicle[0].sold) {
        return res.status(400).json({ error: "Vehicle is already sold" });
      }
      
      // Verify dealer exists
      const dealer = await db.select().from(dealers).where(eq(dealers.id, dealerId)).limit(1);
      if (!dealer.length) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      
      // Record the sale
      const [newSale] = await db.insert(sales).values({
        vehicleId,
        dealerId,
        salePrice,
        pointsAwarded,
        saleDate: new Date()
      }).returning();
      
      // Update vehicle status to sold
      await db.update(vehicles).set({ sold: true }).where(eq(vehicles.id, vehicleId));
      
      // Update dealer's stats
      if (dealer[0]) {
        await db.update(dealers)
          .set({ 
            sales: dealer[0].sales + 1,
            points: dealer[0].points + pointsAwarded
          })
          .where(eq(dealers.id, dealerId));
      }
      
      return res.status(201).json(newSale);
    } catch (error) {
      console.error("Error recording sale:", error);
      return res.status(500).json({ error: "Failed to record sale" });
    }
  });

  // Get all sales with related data
  app.get(`${apiPrefix}/sales`, async (req, res) => {
    try {
      const allSales = await db.query.sales.findMany({
        with: {
          vehicle: {
            with: {
              brand: true
            }
          },
          dealer: true
        },
        orderBy: [desc(sales.saleDate)]
      });
      
      return res.json(allSales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      return res.status(500).json({ error: "Failed to fetch sales data" });
    }
  });
  
  // Get sales for a specific dealer
  app.get(`${apiPrefix}/dealers/:id/sales`, async (req, res) => {
    try {
      const { id } = req.params;
      
      const dealerSales = await db.query.sales.findMany({
        where: eq(sales.dealerId, Number(id)),
        with: {
          vehicle: {
            with: {
              brand: true
            }
          },
          dealer: true
        },
        orderBy: [desc(sales.saleDate)]
      });
      
      return res.json(dealerSales);
    } catch (error) {
      console.error("Error fetching dealer sales:", error);
      return res.status(500).json({ error: "Failed to fetch dealer sales data" });
    }
  });

  // Cancel a sale
  app.patch(`${apiPrefix}/sales/:id/cancel`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify sale exists and is not already cancelled
      const sale = await db.select().from(sales).where(eq(sales.id, Number(id))).limit(1);
      if (!sale.length) {
        return res.status(404).json({ error: "Sale not found" });
      }
      if (sale[0].cancelled) {
        return res.status(400).json({ error: "Sale is already cancelled" });
      }
      
      // Cancel the sale
      const [updatedSale] = await db.update(sales)
        .set({ 
          cancelled: true,
          cancellationDate: new Date()
        })
        .where(eq(sales.id, Number(id)))
        .returning();
      
      // Revert vehicle status
      await db.update(vehicles)
        .set({ sold: false })
        .where(eq(vehicles.id, sale[0].vehicleId));
      
      // Update dealer's stats
      const dealer = await db.select().from(dealers).where(eq(dealers.id, sale[0].dealerId)).limit(1);
      if (dealer[0]) {
        await db.update(dealers)
          .set({ 
            sales: dealer[0].sales - 1,
            points: dealer[0].points - sale[0].pointsAwarded
          })
          .where(eq(dealers.id, sale[0].dealerId));
      }
      
      return res.json(updatedSale);
    } catch (error) {
      console.error("Error cancelling sale:", error);
      return res.status(500).json({ error: "Failed to cancel sale" });
    }
  });

  // Reviews routes
  app.get(`${apiPrefix}/reviews`, async (req, res) => {
    try {
      const allReviews = await db.select().from(reviews).orderBy(desc(reviews.date));
      return res.json(allReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Instagram posts routes
  app.get(`${apiPrefix}/instagram-posts`, async (req, res) => {
    try {
      const posts = await db.select().from(instagramPosts).orderBy(desc(instagramPosts.createdAt));
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching Instagram posts:", error);
      return res.status(500).json({ error: "Failed to fetch Instagram posts" });
    }
  });
  
  // Hero Carousel Slides Routes
  app.get(`${apiPrefix}/hero-slides`, async (req, res) => {
    try {
      const slides = await db.select().from(heroSlides).orderBy(asc(heroSlides.order));
      return res.json(slides);
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      return res.status(500).json({ error: "Failed to fetch hero slides" });
    }
  });
  
  app.post(`${apiPrefix}/hero-slides`, async (req, res) => {
    try {
      const slideData = heroSlidesInsertSchema.parse(req.body);
      
      // Obter a maior ordem atual e adicionar 1
      const maxOrderResult = await db.select({ maxOrder: sql`MAX(${heroSlides.order})` }).from(heroSlides);
      const order = (maxOrderResult[0]?.maxOrder || 0) + 1;
      
      const [newSlide] = await db.insert(heroSlides).values({
        ...slideData,
        order
      }).returning();
      
      return res.status(201).json(newSlide);
    } catch (error) {
      console.error("Error creating hero slide:", error);
      return res.status(500).json({ error: "Failed to create hero slide" });
    }
  });
  
  app.put(`${apiPrefix}/hero-slides/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const slideData = req.body;
      
      // Validar dados
      if (!slideData.imageUrl || !slideData.title || !slideData.subtitle) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Verificar se o slide existe
      const existingSlide = await db.select().from(heroSlides).where(eq(heroSlides.id, Number(id))).limit(1);
      if (!existingSlide.length) {
        return res.status(404).json({ error: "Slide not found" });
      }
      
      const [updatedSlide] = await db.update(heroSlides)
        .set({ 
          imageUrl: slideData.imageUrl,
          title: slideData.title,
          subtitle: slideData.subtitle,
          order: slideData.order !== undefined ? Number(slideData.order) : existingSlide[0].order,
          active: slideData.active !== undefined ? Boolean(slideData.active) : existingSlide[0].active
        })
        .where(eq(heroSlides.id, Number(id)))
        .returning();
      
      return res.json(updatedSlide);
    } catch (error) {
      console.error("Error updating hero slide:", error);
      return res.status(500).json({ error: "Failed to update hero slide" });
    }
  });
  
  app.delete(`${apiPrefix}/hero-slides/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o slide existe
      const existingSlide = await db.select().from(heroSlides).where(eq(heroSlides.id, Number(id))).limit(1);
      if (!existingSlide.length) {
        return res.status(404).json({ error: "Slide not found" });
      }
      
      await db.delete(heroSlides).where(eq(heroSlides.id, Number(id)));
      
      // Reorganizar as ordens dos slides restantes
      const remainingSlides = await db.select().from(heroSlides).orderBy(asc(heroSlides.order));
      for (let i = 0; i < remainingSlides.length; i++) {
        await db.update(heroSlides)
          .set({ order: i + 1 })
          .where(eq(heroSlides.id, remainingSlides[i].id));
      }
      
      return res.json({ success: true, message: "Slide deleted successfully" });
    } catch (error) {
      console.error("Error deleting hero slide:", error);
      return res.status(500).json({ error: "Failed to delete hero slide" });
    }
  });

  // API para destaques especiais
  app.get(`${apiPrefix}/featured-vehicles`, async (req, res) => {
    try {
      // Obter os veículos marcados como destaque
      const featuredVehicles = await db.select()
        .from(vehicles)
        .where(eq(vehicles.featured, true))
        .orderBy(desc(vehicles.createdAt));
      
      // Buscar os detalhes da marca para cada veículo
      const vehiclesWithBrands = await Promise.all(
        featuredVehicles.map(async (vehicle) => {
          const brand = await db.select().from(brands).where(eq(brands.id, vehicle.brandId)).limit(1);
          return {
            ...vehicle,
            brand: brand[0] || null
          };
        })
      );
      
      return res.json(vehiclesWithBrands);
    } catch (error) {
      console.error("Error fetching featured vehicles:", error);
      return res.status(500).json({ error: "Failed to fetch featured vehicles" });
    }
  });

  // Marcar/Desmarcar veículo como destaque
  app.patch(`${apiPrefix}/vehicles/:id/toggle-featured`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o veículo existe
      const existingVehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(id))).limit(1);
      if (!existingVehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      // Alternar o status de destaque
      const newFeaturedStatus = !existingVehicle[0].featured;
      
      const [updatedVehicle] = await db.update(vehicles)
        .set({
          featured: newFeaturedStatus
        })
        .where(eq(vehicles.id, Number(id)))
        .returning();

      return res.json({
        ...updatedVehicle,
        message: newFeaturedStatus 
          ? "Vehicle marked as featured successfully" 
          : "Vehicle removed from featured successfully"
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      return res.status(500).json({ error: "Failed to update featured status" });
    }
  });

  // Rota para salvar configurações (email, Instagram token, etc.)
  app.post(`${apiPrefix}/settings`, async (req, res) => {
    try {
      const { contactEmail, instagramToken } = req.body;
      
      // Aqui você poderia salvar as configurações em uma tabela específica no banco de dados
      // Por enquanto, apenas retornamos uma confirmação de sucesso
      
      return res.json({ 
        success: true, 
        message: "Settings updated successfully",
        settings: {
          contactEmail,
          instagramToken: instagramToken ? "***token salvo***" : null
        }
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // API para formulários de avaliação (redirecionado para a implementação principal em /evaluation-requests)

  // API para formulários de financiamento - redirecionado para a implementação principal

  // APIs para gerenciar imagens adicionais dos veículos
  app.get(`${apiPrefix}/vehicles/:vehicleId/images`, async (req, res) => {
    try {
      const { vehicleId } = req.params;
      
      // Verificar se o veículo existe
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(vehicleId))).limit(1);
      if (!vehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Buscar todas as imagens do veículo
      const images = await db.select()
        .from(vehicleImages)
        .where(eq(vehicleImages.vehicleId, Number(vehicleId)))
        .orderBy(asc(vehicleImages.order));
      
      return res.json(images);
    } catch (error) {
      console.error("Error fetching vehicle images:", error);
      return res.status(500).json({ error: "Failed to fetch vehicle images" });
    }
  });
  
  // Adicionar uma nova imagem a um veículo
  app.post(`${apiPrefix}/vehicles/:vehicleId/images`, async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const { imageUrl, order } = req.body;
      
      // Validar dados
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }
      
      // Verificar se o veículo existe
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, Number(vehicleId))).limit(1);
      if (!vehicle.length) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Adicionar a imagem
      const [newImage] = await db.insert(vehicleImages).values({
        vehicleId: Number(vehicleId),
        imageUrl,
        order: order !== undefined ? Number(order) : 0
      }).returning();
      
      return res.status(201).json(newImage);
    } catch (error) {
      console.error("Error adding vehicle image:", error);
      return res.status(500).json({ error: "Failed to add vehicle image" });
    }
  });
  
  // Atualizar ordem de uma imagem
  app.patch(`${apiPrefix}/vehicles/:vehicleId/images/:imageId`, async (req, res) => {
    try {
      const { vehicleId, imageId } = req.params;
      const { order } = req.body;
      
      if (order === undefined) {
        return res.status(400).json({ error: "Order is required" });
      }
      
      // Verificar se a imagem existe e pertence ao veículo correto
      const image = await db.select()
        .from(vehicleImages)
        .where(
          and(
            eq(vehicleImages.id, Number(imageId)),
            eq(vehicleImages.vehicleId, Number(vehicleId))
          )
        )
        .limit(1);
      
      if (!image.length) {
        return res.status(404).json({ error: "Image not found or doesn't belong to this vehicle" });
      }
      
      // Atualizar a ordem
      const [updatedImage] = await db.update(vehicleImages)
        .set({ order: Number(order) })
        .where(eq(vehicleImages.id, Number(imageId)))
        .returning();
      
      return res.json(updatedImage);
    } catch (error) {
      console.error("Error updating vehicle image:", error);
      return res.status(500).json({ error: "Failed to update vehicle image" });
    }
  });
  
  // Excluir uma imagem
  app.delete(`${apiPrefix}/vehicles/:vehicleId/images/:imageId`, async (req, res) => {
    try {
      const { vehicleId, imageId } = req.params;
      
      // Verificar se a imagem existe e pertence ao veículo correto
      const image = await db.select()
        .from(vehicleImages)
        .where(
          and(
            eq(vehicleImages.id, Number(imageId)),
            eq(vehicleImages.vehicleId, Number(vehicleId))
          )
        )
        .limit(1);
      
      if (!image.length) {
        return res.status(404).json({ error: "Image not found or doesn't belong to this vehicle" });
      }
      
      // Excluir a imagem
      await db.delete(vehicleImages).where(eq(vehicleImages.id, Number(imageId)));
      
      return res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle image:", error);
      return res.status(500).json({ error: "Failed to delete vehicle image" });
    }
  });

  // Rotas para solicitações de avaliação
  // Listar todas as solicitações de avaliação
  app.get(`${apiPrefix}/evaluation-requests`, async (req, res) => {
    try {
      const { status, limit } = req.query;
      
      let query = db.select().from(evaluationRequests);
      
      if (status && status !== 'all') {
        // Usamos a verificação de casting para garantir que o status seja um valor válido
        const statusStr = String(status);
        const validStatus = ['pending', 'contacted', 'completed', 'cancelled'].includes(statusStr) 
          ? statusStr as 'pending' | 'contacted' | 'completed' | 'cancelled'
          : 'pending';
          
        query = query.where(eq(evaluationRequests.status, validStatus));
      }
      
      const evaluationRequestsList = await query.orderBy(desc(evaluationRequests.requestDate));
      
      return res.json(evaluationRequestsList);
    } catch (error) {
      console.error("Error fetching evaluation requests:", error);
      return res.status(500).json({ error: "Failed to fetch evaluation requests" });
    }
  });
  
  // Criar uma nova solicitação de avaliação
  app.post(`${apiPrefix}/evaluation-requests`, async (req, res) => {
    try {
      const { name, email, phone, vehicleInfo } = req.body;
      
      // Validação básica
      if (!name || !email || !phone || !vehicleInfo) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Criar a solicitação no banco de dados      
      const [newRequest] = await db.insert(evaluationRequests).values({
        name,
        email,
        phone,
        vehicleInfo,
        status: 'pending',
        notes: req.body.notes || null
      }).returning();
      
      return res.status(201).json({
        success: true,
        message: "Evaluation request received successfully",
        request: newRequest
      });
    } catch (error) {
      console.error("Error creating evaluation request:", error);
      return res.status(500).json({ error: "Failed to create evaluation request" });
    }
  });
  
  // Atualizar status da solicitação de avaliação
  app.patch(`${apiPrefix}/evaluation-requests/:id/status`, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      // Validação
      if (!status || !['pending', 'contacted', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      // Verificar se a solicitação existe
      const request = await db.select().from(evaluationRequests).where(eq(evaluationRequests.id, Number(id))).limit(1);
      if (!request.length) {
        return res.status(404).json({ error: "Evaluation request not found" });
      }
      
      // Atualizar status
      const [updatedRequest] = await db.update(evaluationRequests)
        .set({ 
          status: status as any,
          notes: notes || request[0].notes
        })
        .where(eq(evaluationRequests.id, Number(id)))
        .returning();
      
      return res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating evaluation request status:", error);
      return res.status(500).json({ error: "Failed to update evaluation request status" });
    }
  });
  
  // Excluir solicitação de avaliação
  app.delete(`${apiPrefix}/evaluation-requests/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a solicitação existe
      const request = await db.select().from(evaluationRequests).where(eq(evaluationRequests.id, Number(id))).limit(1);
      if (!request.length) {
        return res.status(404).json({ error: "Evaluation request not found" });
      }
      
      await db.delete(evaluationRequests).where(eq(evaluationRequests.id, Number(id)));
      
      return res.json({ success: true, message: "Evaluation request deleted successfully" });
    } catch (error) {
      console.error("Error deleting evaluation request:", error);
      return res.status(500).json({ error: "Failed to delete evaluation request" });
    }
  });
  
  // Rotas para solicitações de financiamento
  // Listar todas as solicitações de financiamento
  app.get(`${apiPrefix}/financing-requests`, async (req, res) => {
    try {
      const { status, limit } = req.query;
      
      let query = db.select().from(financingRequests);
      
      if (status && status !== 'all') {
        // Usamos a verificação de casting para garantir que o status seja um valor válido
        const statusStr = String(status);
        const validStatus = ['pending', 'in_review', 'approved', 'denied'].includes(statusStr) 
          ? statusStr as 'pending' | 'in_review' | 'approved' | 'denied' 
          : 'pending';
          
        query = query.where(eq(financingRequests.status, validStatus));
      }
      
      const financingRequestsList = await query.orderBy(desc(financingRequests.requestDate));
      
      return res.json(financingRequestsList);
    } catch (error) {
      console.error("Error fetching financing requests:", error);
      return res.status(500).json({ error: "Failed to fetch financing requests" });
    }
  });
  
  // Criar uma nova solicitação de financiamento
  app.post(`${apiPrefix}/financing-requests`, async (req, res) => {
    try {
      const { name, email, phone, vehicleInfo, income } = req.body;
      
      // Validação básica
      if (!name || !email || !phone || !vehicleInfo || !income) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const [newRequest] = await db.insert(financingRequests).values({
        name,
        email,
        phone,
        vehicleInfo,
        income,
        notes: req.body.notes || null
      }).returning();
      
      return res.status(201).json({
        success: true,
        message: "Financing request received successfully",
        request: newRequest
      });
    } catch (error) {
      console.error("Error creating financing request:", error);
      return res.status(500).json({ error: "Failed to create financing request" });
    }
  });
  
  // Atualizar status da solicitação de financiamento
  app.patch(`${apiPrefix}/financing-requests/:id/status`, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      // Validação
      if (!status || !['pending', 'in_review', 'approved', 'denied'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      // Verificar se a solicitação existe
      const request = await db.select().from(financingRequests).where(eq(financingRequests.id, Number(id))).limit(1);
      if (!request.length) {
        return res.status(404).json({ error: "Financing request not found" });
      }
      
      // Atualizar status
      const [updatedRequest] = await db.update(financingRequests)
        .set({ 
          status: status as any,
          notes: notes || request[0].notes
        })
        .where(eq(financingRequests.id, Number(id)))
        .returning();
      
      return res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating financing request status:", error);
      return res.status(500).json({ error: "Failed to update financing request status" });
    }
  });
  
  // Excluir solicitação de financiamento
  app.delete(`${apiPrefix}/financing-requests/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a solicitação existe
      const request = await db.select().from(financingRequests).where(eq(financingRequests.id, Number(id))).limit(1);
      if (!request.length) {
        return res.status(404).json({ error: "Financing request not found" });
      }
      
      await db.delete(financingRequests).where(eq(financingRequests.id, Number(id)));
      
      return res.json({ success: true, message: "Financing request deleted successfully" });
    } catch (error) {
      console.error("Error deleting financing request:", error);
      return res.status(500).json({ error: "Failed to delete financing request" });
    }
  });
  
  // ====== Rotas para avaliações do Google ======
  // Listar todas as avaliações
  app.get(`${apiPrefix}/reviews`, async (req, res) => {
    try {
      const reviewsList = await db.select().from(reviews).orderBy(desc(reviews.id));
      return res.json(reviewsList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  
  // Criar uma nova avaliação
  app.post(`${apiPrefix}/reviews`, async (req, res) => {
    try {
      const { name, avatarInitial, rating, comment, date } = req.body;
      
      // Validação básica
      if (!name || !rating || !comment || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Converter a data para um objeto Date se necessário
      let formattedDate;
      try {
        // Tenta converter para Date
        formattedDate = new Date(date);
        if (isNaN(formattedDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (err) {
        console.error("Date conversion error:", err);
        return res.status(400).json({ error: "Invalid date format" });
      }
      
      // Criar a avaliação no banco de dados
      const [newReview] = await db.insert(reviews).values({
        name,
        avatarInitial: avatarInitial || name.charAt(0).toUpperCase(),
        rating: Number(rating),
        comment,
        date: formattedDate
      }).returning();
      
      return res.status(201).json(newReview);
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ error: "Failed to create review" });
    }
  });
  
  // Atualizar uma avaliação
  app.put(`${apiPrefix}/reviews/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, avatarInitial, rating, comment, date } = req.body;
      
      // Validação básica
      if (!name || !rating || !comment || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Verificar se a avaliação existe
      const review = await db.select().from(reviews).where(eq(reviews.id, Number(id))).limit(1);
      if (!review.length) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      // Atualizar a avaliação
      const [updatedReview] = await db.update(reviews)
        .set({
          name,
          avatarInitial: avatarInitial || name.charAt(0).toUpperCase(),
          rating: Number(rating),
          comment,
          date
        })
        .where(eq(reviews.id, Number(id)))
        .returning();
      
      return res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      return res.status(500).json({ error: "Failed to update review" });
    }
  });
  
  // Excluir uma avaliação
  app.delete(`${apiPrefix}/reviews/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a avaliação existe
      const review = await db.select().from(reviews).where(eq(reviews.id, Number(id))).limit(1);
      if (!review.length) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      await db.delete(reviews).where(eq(reviews.id, Number(id)));
      
      return res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ error: "Failed to delete review" });
    }
  });
  
  // ====== Rotas para posts do Instagram ======
  // Listar todos os posts
  app.get(`${apiPrefix}/instagram-posts`, async (req, res) => {
    try {
      const postsList = await db.select().from(instagramPosts).orderBy(desc(instagramPosts.id));
      return res.json(postsList);
    } catch (error) {
      console.error("Error fetching Instagram posts:", error);
      return res.status(500).json({ error: "Failed to fetch Instagram posts" });
    }
  });
  
  // Criar um novo post
  app.post(`${apiPrefix}/instagram-posts`, async (req, res) => {
    try {
      const { imageUrl, likes, postUrl } = req.body;
      
      // Validação básica
      if (!imageUrl || !postUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Criar o post no banco de dados
      const [newPost] = await db.insert(instagramPosts).values({
        imageUrl,
        likes: Number(likes) || 0,
        postUrl
      }).returning();
      
      return res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating Instagram post:", error);
      return res.status(500).json({ error: "Failed to create Instagram post" });
    }
  });
  
  // Atualizar um post
  app.put(`${apiPrefix}/instagram-posts/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl, likes, postUrl } = req.body;
      
      // Validação básica
      if (!imageUrl || !postUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Verificar se o post existe
      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, Number(id))).limit(1);
      if (!post.length) {
        return res.status(404).json({ error: "Instagram post not found" });
      }
      
      // Atualizar o post
      const [updatedPost] = await db.update(instagramPosts)
        .set({
          imageUrl,
          likes: Number(likes) || 0,
          postUrl
        })
        .where(eq(instagramPosts.id, Number(id)))
        .returning();
      
      return res.json(updatedPost);
    } catch (error) {
      console.error("Error updating Instagram post:", error);
      return res.status(500).json({ error: "Failed to update Instagram post" });
    }
  });
  
  // Excluir um post
  app.delete(`${apiPrefix}/instagram-posts/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o post existe
      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, Number(id))).limit(1);
      if (!post.length) {
        return res.status(404).json({ error: "Instagram post not found" });
      }
      
      await db.delete(instagramPosts).where(eq(instagramPosts.id, Number(id)));
      
      return res.json({ success: true, message: "Instagram post deleted successfully" });
    } catch (error) {
      console.error("Error deleting Instagram post:", error);
      return res.status(500).json({ error: "Failed to delete Instagram post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
