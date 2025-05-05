import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { brands, vehicles, dealers, sales, reviews, instagramPosts } from "@shared/schema";
import { eq, and, not, desc, asc, like, or, gte, lte } from "drizzle-orm";
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
        color
      } = req.query;
      
      let conditions: SQL[] = [not(eq(vehicles.sold, true))];
      
      if (brandId && brandId !== 'all') {
        conditions.push(eq(vehicles.brandId, Number(brandId)));
      }
      
      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(or(
          like(vehicles.model, searchTerm),
          like(vehicles.description, searchTerm)
        ));
      }
      
      if (featured === 'true') {
        conditions.push(eq(vehicles.featured, true));
      }
      
      // Filtro de preço
      if (minPrice) {
        conditions.push(
          gte(vehicles.price, Number(minPrice))
        );
      }
      
      if (maxPrice) {
        conditions.push(
          lte(vehicles.price, Number(maxPrice))
        );
      }
      
      // Filtro de transmissão (pode ser múltiplo, vem como array)
      if (transmission) {
        const transmissionValues = Array.isArray(transmission) ? transmission : [transmission];
        if (transmissionValues.length > 0) {
          const transmissionConditions = transmissionValues.map(t => eq(vehicles.transmission, String(t)));
          conditions.push(or(...transmissionConditions));
        }
      }
      
      // Filtro de combustível (pode ser múltiplo, vem como array)
      if (fuel) {
        const fuelValues = Array.isArray(fuel) ? fuel : [fuel];
        if (fuelValues.length > 0) {
          const fuelConditions = fuelValues.map(f => eq(vehicles.fuel, String(f)));
          conditions.push(or(...fuelConditions));
        }
      }
      
      // Filtro de tipo de carroceria (pode ser múltiplo, vem como array)
      if (bodyType) {
        const bodyTypeValues = Array.isArray(bodyType) ? bodyType : [bodyType];
        if (bodyTypeValues.length > 0) {
          const bodyTypeConditions = bodyTypeValues.map(b => eq(vehicles.bodyType, String(b)));
          conditions.push(or(...bodyTypeConditions));
        }
      }
      
      // Filtro de cor (pode ser múltiplo, vem como array)
      if (color) {
        const colorValues = Array.isArray(color) ? color : [color];
        if (colorValues.length > 0) {
          const colorConditions = colorValues.map(c => eq(vehicles.color, String(c)));
          conditions.push(or(...colorConditions));
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
      
      const brand = await db.select().from(brands).where(eq(brands.id, vehicle[0].brandId)).limit(1);
      
      return res.json({
        ...vehicle[0],
        brand: brand[0] || null
      });
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  // Dealers and sales routes
  app.get(`${apiPrefix}/dealers/ranking`, async (req, res) => {
    try {
      const dealersRanking = await db.select().from(dealers).orderBy(desc(dealers.points));
      return res.json(dealersRanking);
    } catch (error) {
      console.error("Error fetching dealer rankings:", error);
      return res.status(500).json({ error: "Failed to fetch dealer rankings" });
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

  const httpServer = createServer(app);
  return httpServer;
}
