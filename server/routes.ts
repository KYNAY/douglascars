import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  brands, vehicles, dealers, sales, reviews, instagramPosts, vehicleImages,
  evaluationRequests, financingRequests, evaluationStatusEnum, financingStatusEnum
} from "@shared/schema";
import { eq, and, not, desc, asc, like, or, gte, lte, count, sql } from "drizzle-orm";
import { SQL } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

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
        minPrice,
        maxPrice,
        transmission,
        fuel,
        bodyType,
        color,
        vehicleType
      } = req.query;
      
      let conditions: SQL[] = [not(eq(vehicles.sold, true))];
      
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
      
      // Fetch brand details for each vehicle
      const vehiclesWithBrands = await Promise.all(
        result.map(async (vehicle) => {
          const brand = await db.select().from(brands).where(eq(brands.id, vehicle.brandId)).limit(1);
          return {
            ...vehicle,
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
      
      return res.json({
        ...vehicle[0],
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
      const mileage = vehicleData.mileage ? Number(vehicleData.mileage) : 0;

      // Garantir que campos booleanos estejam corretos
      const featured = vehicleData.featured === true;
      const sold = vehicleData.sold === true;

      const [newVehicle] = await db.insert(vehicles).values({
        model: vehicleData.model,
        brandId,
        year: vehicleData.year,
        color: vehicleData.color || "",
        price: vehicleData.price.toString(),
        originalPrice: vehicleData.originalPrice ? vehicleData.originalPrice.toString() : null,
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
      const mileage = vehicleData.mileage ? Number(vehicleData.mileage) : 0;

      // Garantir que campos booleanos estejam corretos
      const featured = vehicleData.featured === true;
      const sold = vehicleData.sold === true;

      const [updatedVehicle] = await db.update(vehicles)
        .set({
          model: vehicleData.model,
          brandId,
          year: vehicleData.year,
          color: vehicleData.color || "",
          price: vehicleData.price.toString(),
          originalPrice: vehicleData.originalPrice ? vehicleData.originalPrice.toString() : null,
          mileage,
          description: vehicleData.description || null,
          featured,
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
      const dealerData = dealersInsertSchema.parse(req.body);
      
      // Check if dealer with same email already exists
      const existingDealer = await db.select().from(dealers).where(eq(dealers.email, dealerData.email)).limit(1);
      if (existingDealer.length > 0) {
        return res.status(400).json({ error: "Dealer with this email already exists" });
      }
      
      const [newDealer] = await db.insert(dealers).values(dealerData).returning();
      return res.status(201).json(newDealer);
    } catch (error) {
      console.error("Error creating dealer:", error);
      return res.status(500).json({ error: "Failed to create dealer" });
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
      
      // Check if dealer exists
      const dealer = await db.select().from(dealers).where(eq(dealers.id, dealerId)).limit(1);
      if (!dealer.length) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      
      // Update vehicle as sold
      await db.update(vehicles)
        .set({ sold: true })
        .where(eq(vehicles.id, Number(id)));
      
      // Record the sale
      const salePrice = typeof vehicle[0].price === 'string' 
        ? parseFloat(vehicle[0].price) 
        : vehicle[0].price;
        
      const [newSale] = await db.insert(sales).values({
        vehicleId: Number(id),
        dealerId: dealerId,
        salePrice: salePrice,
        saleDate: soldDate ? new Date(soldDate) : new Date()
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

  // API para formulários de avaliação
  app.post(`${apiPrefix}/evaluation-requests`, async (req, res) => {
    try {
      const { name, email, phone, vehicleInfo } = req.body;
      
      // Validar campos obrigatórios
      if (!name || !email || !phone || !vehicleInfo) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Aqui você salvaria os dados no banco em uma tabela específica
      // Por enquanto, apenas simulamos um retorno de sucesso
      
      return res.status(201).json({
        success: true,
        message: "Evaluation request received successfully",
        request: {
          id: Date.now(),
          name,
          email,
          phone,
          vehicleInfo,
          requestDate: new Date(),
          status: 'pending'
        }
      });
    } catch (error) {
      console.error("Error submitting evaluation request:", error);
      return res.status(500).json({ error: "Failed to submit evaluation request" });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
