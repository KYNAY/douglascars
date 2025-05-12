-- Criar schema douglascars
CREATE SCHEMA IF NOT EXISTS douglascars;

-- Configurar search_path para o schema douglascars
SET search_path TO douglascars;

-- Tipos enum
CREATE TYPE douglascars.evaluation_status AS ENUM ('pending', 'contacted', 'completed', 'cancelled');
CREATE TYPE douglascars.financing_status AS ENUM ('pending', 'in_review', 'approved', 'denied');

-- Tabela brands
CREATE TABLE douglascars.brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela vehicles
CREATE TABLE douglascars.vehicles (
    id SERIAL PRIMARY KEY,
    "brandId" INTEGER NOT NULL,
    model TEXT NOT NULL,
    year TEXT NOT NULL,
    color TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    "originalPrice" DECIMAL(15,2),
    mileage INTEGER NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT false NOT NULL,
    sold BOOLEAN DEFAULT false NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    warranty TEXT DEFAULT 'Consultar',
    "optionalFeatures" JSONB,
    CONSTRAINT fk_brand FOREIGN KEY("brandId") REFERENCES douglascars.brands(id)
);

-- Tabela vehicle_images
CREATE TABLE douglascars.vehicle_images (
    id SERIAL PRIMARY KEY,
    "vehicleId" INTEGER NOT NULL,
    url TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_vehicle FOREIGN KEY("vehicleId") REFERENCES douglascars.vehicles(id) ON DELETE CASCADE
);

-- Tabela dealers
CREATE TABLE douglascars.dealers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    "startDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    sales INTEGER DEFAULT 0 NOT NULL
);

-- Tabela sales
CREATE TABLE douglascars.sales (
    id SERIAL PRIMARY KEY,
    "vehicleId" INTEGER NOT NULL,
    "dealerId" INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_vehicle FOREIGN KEY("vehicleId") REFERENCES douglascars.vehicles(id),
    CONSTRAINT fk_dealer FOREIGN KEY("dealerId") REFERENCES douglascars.dealers(id)
);

-- Tabela reviews
CREATE TABLE douglascars.reviews (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    "avatarInitial" TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela instagram_posts
CREATE TABLE douglascars.instagram_posts (
    id SERIAL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    likes INTEGER DEFAULT 0 NOT NULL,
    "postUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela hero_slides
CREATE TABLE douglascars.hero_slides (
    id SERIAL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela evaluation_requests
CREATE TABLE douglascars.evaluation_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year TEXT NOT NULL,
    notes TEXT,
    status evaluation_status DEFAULT 'pending' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela financing_requests
CREATE TABLE douglascars.financing_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    "vehicleInfo" JSONB,
    income TEXT NOT NULL,
    "downPayment" TEXT NOT NULL,
    term INTEGER NOT NULL,
    notes JSONB,
    status financing_status DEFAULT 'pending' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
