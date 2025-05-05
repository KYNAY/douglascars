import { pgTable, text, serial, integer, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Brands table
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  model: text('model').notNull(),
  year: text('year').notNull(), // Format: "2023/2024"
  color: text('color').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  mileage: integer('mileage').notNull(), // in km
  description: text('description'),
  featured: boolean('featured').default(false),
  sold: boolean('sold').default(false),
  imageUrl: text('image_url').notNull(),
  transmission: text('transmission').default('Manual'), // Automatizado, Automático, Manual
  fuel: text('fuel').default('Flex'), // Diesel, Flex, Gasolina, Gasolina e Elétrico
  bodyType: text('body_type'), // Carroceria: Sedan, SUV, etc.
  vehicleType: text('vehicle_type').default('car'), // 'car' ou 'motorcycle'
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Dealers table
export const dealers = pgTable('dealers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  startDate: timestamp('start_date').notNull(),
  points: integer('points').default(0),
  sales: integer('sales').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Sales table
export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  dealerId: integer('dealer_id').references(() => dealers.id).notNull(),
  saleDate: timestamp('sale_date').defaultNow().notNull(),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
  cancelled: boolean('cancelled').default(false),
  cancellationDate: timestamp('cancellation_date'),
  pointsAwarded: integer('points_awarded').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  avatarInitial: text('avatar_initial').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Instagram posts table
export const instagramPosts = pgTable('instagram_posts', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  likes: integer('likes').default(0),
  postUrl: text('post_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const brandsRelations = relations(brands, ({ many }) => ({
  vehicles: many(vehicles)
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  brand: one(brands, { fields: [vehicles.brandId], references: [brands.id] }),
  sales: many(sales)
}));

export const dealersRelations = relations(dealers, ({ many }) => ({
  sales: many(sales)
}));

export const salesRelations = relations(sales, ({ one }) => ({
  vehicle: one(vehicles, { fields: [sales.vehicleId], references: [vehicles.id] }),
  dealer: one(dealers, { fields: [sales.dealerId], references: [dealers.id] })
}));

// Validation schemas
export const brandsInsertSchema = createInsertSchema(brands, {
  name: (schema) => schema.min(2, "Brand name must be at least 2 characters")
});
export type BrandInsert = z.infer<typeof brandsInsertSchema>;
export const brandsSelectSchema = createSelectSchema(brands);
export type Brand = z.infer<typeof brandsSelectSchema>;

export const vehiclesInsertSchema = createInsertSchema(vehicles, {
  model: (schema) => schema.min(2, "Model must be at least 2 characters"),
  year: (schema) => schema.regex(/^\d{4}\/\d{4}$/, "Year must be in format YYYY/YYYY"),
  color: (schema) => schema.min(2, "Color must be at least 2 characters"),
  mileage: (schema) => schema.nonnegative("Mileage cannot be negative")
});
export type VehicleInsert = z.infer<typeof vehiclesInsertSchema>;
export const vehiclesSelectSchema = createSelectSchema(vehicles);
export type Vehicle = z.infer<typeof vehiclesSelectSchema>;

export const dealersInsertSchema = createInsertSchema(dealers, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters")
});
export type DealerInsert = z.infer<typeof dealersInsertSchema>;
export const dealersSelectSchema = createSelectSchema(dealers);
export type Dealer = z.infer<typeof dealersSelectSchema>;

export const salesInsertSchema = createInsertSchema(sales);
export type SaleInsert = z.infer<typeof salesInsertSchema>;
export const salesSelectSchema = createSelectSchema(sales);
export type Sale = z.infer<typeof salesSelectSchema>;

export const reviewsInsertSchema = createInsertSchema(reviews, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  rating: (schema) => schema.min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: (schema) => schema.min(5, "Comment must be at least 5 characters")
});
export type ReviewInsert = z.infer<typeof reviewsInsertSchema>;
export const reviewsSelectSchema = createSelectSchema(reviews);
export type Review = z.infer<typeof reviewsSelectSchema>;

export const instagramPostsInsertSchema = createInsertSchema(instagramPosts);
export type InstagramPostInsert = z.infer<typeof instagramPostsInsertSchema>;
export const instagramPostsSelectSchema = createSelectSchema(instagramPosts);
export type InstagramPost = z.infer<typeof instagramPostsSelectSchema>;
