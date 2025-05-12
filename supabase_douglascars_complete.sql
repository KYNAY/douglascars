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
-- Configurar search_path para o schema douglascars
SET search_path TO douglascars;

-- Inserir dados na tabela brands
INSERT INTO douglascars.brands VALUES (33, 'BMW', 'https://static.autoconf.com.br/marcas/bmw.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (34, 'BYD', 'https://static.autoconf.com.br/marcas/byd.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (35, 'CHERY', 'https://static.autoconf.com.br/marcas/chery.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (36, 'Chevrolet', 'https://static.autoconf.com.br/marcas/gm-chevrolet.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (37, 'Citroën', 'https://static.autoconf.com.br/marcas/citroen.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (38, 'Fiat', 'https://static.autoconf.com.br/marcas/fiat.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (39, 'Ford', 'https://static.autoconf.com.br/marcas/ford.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (40, 'Honda', 'https://static.autoconf.com.br/marcas/honda.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (41, 'Hyundai', 'https://static.autoconf.com.br/marcas/hyundai.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (42, 'Jeep', 'https://static.autoconf.com.br/marcas/jeep.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (43, 'Kia', 'https://static.autoconf.com.br/marcas/kia.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (44, 'Land Rover', 'https://static.autoconf.com.br/marcas/land-rover.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (45, 'Lexus', 'https://static.autoconf.com.br/marcas/lexus.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (46, 'Mercedes-Benz', 'https://static.autoconf.com.br/marcas/mercedes-benz.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (47, 'Mitsubishi', 'https://static.autoconf.com.br/marcas/mitsubishi.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (48, 'Nissan', 'https://static.autoconf.com.br/marcas/nissan.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (49, 'Peugeot', 'https://static.autoconf.com.br/marcas/peugeot.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (50, 'Porsche', 'https://static.autoconf.com.br/marcas/porsche.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (51, 'Renault', 'https://static.autoconf.com.br/marcas/renault.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (52, 'Subaru', 'https://static.autoconf.com.br/marcas/subaru.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (53, 'Suzuki', 'https://static.autoconf.com.br/marcas/suzuki.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (54, 'Toyota', 'https://static.autoconf.com.br/marcas/toyota.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (55, 'Volkswagen', 'https://static.autoconf.com.br/marcas/vw-volkswagen.png', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.brands VALUES (56, 'Volvo', 'https://static.autoconf.com.br/marcas/volvo.png', '2025-05-05 11:22:15.104997');

-- Inserir dados na tabela reviews
INSERT INTO douglascars.reviews VALUES (10, 'Ronaldo Costa', 'R', 5, 'Serviço excelente! Comprei meu novo Honda Civic e fui muito bem atendido. Super recomendo!', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.reviews VALUES (11, 'Ana Beatriz', 'A', 5, 'Atendimento incrível! O processo de financiamento foi rápido e sem complicações.', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.reviews VALUES (12, 'Marcelo Sousa', 'M', 4, 'Ótima seleção de carros. Encontrei exatamente o que estava procurando.', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.reviews VALUES (13, 'Juliana Mendes', 'J', 5, 'Superou minhas expectativas! Equipe muito profissional e atenciosa.', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.reviews VALUES (14, 'Lucas Oliveira', 'L', 4, 'Ótima concessionária, preços justos e veículos bem conservados.', '2025-05-05 11:22:15.104997');

-- Inserir dados na tabela instagram_posts
INSERT INTO douglascars.instagram_posts VALUES (24, 'https://kiing.linsw.co/5tEE03', 123, 'https://instagram.com/p/ABC123', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.instagram_posts VALUES (25, 'https://kiing.linsw.co/F0sD11', 85, 'https://instagram.com/p/DEF456', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.instagram_posts VALUES (26, 'https://kiing.linsw.co/sTW09q', 142, 'https://instagram.com/p/GHI789', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.instagram_posts VALUES (27, 'https://kiing.linsw.co/pOf34A', 98, 'https://instagram.com/p/JKL012', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.instagram_posts VALUES (28, 'https://kiing.linsw.co/T4gH78', 167, 'https://instagram.com/p/MNO345', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.instagram_posts VALUES (29, 'https://kiing.linsw.co/qwEr56', 104, 'https://instagram.com/p/PQR678', '2025-05-05 11:22:15.104997');

-- Inserir dados na tabela vehicles
INSERT INTO douglascars.vehicles VALUES (101, 40, 'Civic Touring', '2023/2023', 'Preto', 155000.00, 165000.00, 15000, 'Honda Civic Touring 2023, completo, único dono, IPVA pago.', true, false, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vdG95b3RhL2NvcnJvbGxhLzFlZTRlM2QxLzkwMHg2NzRfeHJ3X2MxZmRmZjE5MGUuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997', '3 anos ou 100.000 km', NULL);
INSERT INTO douglascars.vehicles VALUES (102, 54, 'Corolla XEI', '2022/2022', 'Branco', 135000.00, 140000.00, 32000, 'Toyota Corolla XEI 2.0, completo, teto solar, multimídia.', false, false, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vaG9uZGEvY2l0eS81MDlkYzZkNi85MDB4Njc0X3hyd19lN2JhZGIzM2M5LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb250YWluIiwid2lkdGgiOjEyMDAsImhlaWdodCI6OTAwfX19', '2025-05-05 11:22:15.104997', '3 anos ou 100.000 km', NULL);
INSERT INTO douglascars.vehicles VALUES (103, 38, 'Pulse Impetus', '2023/2024', 'Vermelho', 98000.00, 102000.00, 8500, 'Fiat Pulse Impetus, motor 1.0 turbo, câmbio automático, completo.', true, false, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vZmlhdC9wdWxzZS9kYTU1ZTBhNS85MDB4Njc0X3hyd19kNWZlOTc5Y2I0LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb250YWluIiwid2lkdGgiOjEyMDAsImhlaWdodCI6OTAwfX19', '2025-05-05 11:22:15.104997', '3 anos ou 100.000 km', NULL);
INSERT INTO douglascars.vehicles VALUES (104, 42, 'Compass Limited', '2022/2023', 'Cinza', 175000.00, 185000.00, 29000, 'Jeep Compass Limited, motor 1.3 turbo, 4x2, teto panorâmico, multimídia de 10".', false, false, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vamVlcC9jb21wYXNzLzA2OTQ0MzhmLzkwMHg2NzRfeHJ3X2UwMzM1Yjc4MjEuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997', '5 anos ou 100.000 km', NULL);
INSERT INTO douglascars.vehicles VALUES (105, 55, 'T-Cross Highline', '2022/2023', 'Prata', 125000.00, 129000.00, 35000, 'Volkswagen T-Cross Highline, motor 1.4 TSI, completo, teto solar.', true, false, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vdm9sa3N3YWdlbi90LWNyb3NzLzNhZDRkZmJkLzkwMHg2NzRfeHJ3X2VmOTQ2MzJmODIuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997', '3 anos ou 100.000 km', NULL);

-- Inserir dados na tabela vehicle_images
INSERT INTO douglascars.vehicle_images VALUES (201, 101, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vaG9uZGEvY2l2aWMvMWVlNGUzZDEvOTAweDY3NF94cndpbnRlcmlvcjEuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.vehicle_images VALUES (202, 101, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vaG9uZGEvY2l2aWMvMWVlNGUzZDEvOTAweDY3NF94cndpbnRlcmlvcjIuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.vehicle_images VALUES (203, 102, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vdG95b3RhL2NvcnJvbGxhLzFkZjVkMmM5Lzk0NXg3MDlfeHJ3X2M4ZTI5ODhkNWYuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.vehicle_images VALUES (204, 103, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vZmlhdC9wdWxzZS9kYTU1ZTBhNS85NTR4NzE1X3hyd19iNTYzYmQzOTU3LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb250YWluIiwid2lkdGgiOjEyMDAsImhlaWdodCI6OTAwfX19', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.vehicle_images VALUES (205, 104, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vamVlcC9jb21wYXNzLzA2OTQ0MzhmLzk0NXg3MDlfeHJ3X2VhZGRkZjVkZDYuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.vehicle_images VALUES (206, 105, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vdm9sa3N3YWdlbi90LWNyb3NzLzNhZDRkZmJkLzk0NXg3MDlfeHJ3X2RkY2UyMGI5NzYuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', '2025-05-05 11:22:15.104997');

-- Inserir dados na tabela hero_slides
INSERT INTO douglascars.hero_slides VALUES (1, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vamVlcC9jb21wYXNzLzA2OTQ0MzhmLzkwMHg2NzRfeHJ3X2UwMzM1Yjc4MjEuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', 'Os melhores SUVs', 'Encontre o seu Jeep Compass com os melhores preços');
INSERT INTO douglascars.hero_slides VALUES (2, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vaG9uZGEvY2l2aWMvMWVlNGUzZDEvOTAweDY3NF94cndpbnRlcmlvcjEuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvbnRhaW4iLCJ3aWR0aCI6MTIwMCwiaGVpZ2h0Ijo5MDB9fX0=', 'Sedans de Luxo', 'Conforto e tecnologia em cada detalhe');
INSERT INTO douglascars.hero_slides VALUES (3, 'https://dfkkjsd9muayg.cloudfront.net/eyJidWNrZXQiOiJwdWJsaWNhY29lcy1jYXRhbG9nb3MiLCJrZXkiOiJpbWcvY2FjaG9laXJvLWRvLWl0YXBlbWlyaW0vZmlhdC9wdWxzZS9kYTU1ZTBhNS85NTR4NzE1X3hyd19iNTYzYmQzOTU3LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb250YWluIiwid2lkdGgiOjEyMDAsImhlaWdodCI6OTAwfX19', 'Facilidade no financiamento', 'Aprovação rápida e as melhores taxas');

-- Inserir dados na tabela sales
INSERT INTO douglascars.sales VALUES (1, 101, 1, 152000.00, '2025-02-15 10:30:00+00');
INSERT INTO douglascars.sales VALUES (2, 103, 3, 96500.00, '2025-03-20 15:45:00+00');
INSERT INTO douglascars.sales VALUES (3, 104, 2, 172000.00, '2025-04-05 09:15:00+00');

-- Inserir dados na tabela dealers
INSERT INTO douglascars.dealers VALUES (1, 'João Silva', '2024-01-15 00:00:00+00', 1250, 42);
INSERT INTO douglascars.dealers VALUES (2, 'Maria Oliveira', '2024-02-10 00:00:00+00', 980, 35);
INSERT INTO douglascars.dealers VALUES (3, 'Carlos Santos', '2024-03-05 00:00:00+00', 1520, 48);
INSERT INTO douglascars.dealers VALUES (4, 'Ana Pereira', '2024-01-20 00:00:00+00', 870, 32);
INSERT INTO douglascars.dealers VALUES (5, 'Roberto Gomes', '2024-02-25 00:00:00+00', 1100, 39);

-- Inserir dados na tabela evaluation_requests
INSERT INTO douglascars.evaluation_requests VALUES (3, 'Caique Contarini', 'caique@example.com', '(28) 99999-9999', 'Honda', 'Civic', '2018', 'Carro em bom estado, único dono.', 'pending', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.evaluation_requests VALUES (4, 'José Roberto', 'jose@example.com', '(28) 88888-8888', 'Toyota', 'Corolla', '2020', 'Gostaria de avaliar para possível troca.', 'contacted', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.evaluation_requests VALUES (5, 'Amanda Silva', 'amanda@example.com', '(28) 77777-7777', 'Fiat', 'Uno', '2015', 'Preciso vender com urgência.', 'completed', '2025-05-05 11:22:15.104997');

-- Inserir dados na tabela financing_requests
INSERT INTO douglascars.financing_requests VALUES (7, 'Caique Contarini', 'caique@example.com', '(28) 99999-9999', '{"modelo": "Honda Civic", "ano": "2022", "preco": "R$ 120.000,00"}', 'R$ 5.000,00', 'R$ 30.000,00', 36, '{"cpf": "123.456.789-00", "rg": "1234567", "endereco": "Rua Exemplo, 123"}', 'pending', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.financing_requests VALUES (8, 'Ricardo Almeida', 'ricardo@example.com', '(28) 88888-8888', '{"modelo": "Toyota Corolla", "ano": "2023", "preco": "R$ 150.000,00"}', 'R$ 6.500,00', 'R$ 45.000,00', 48, '{"cpf": "987.654.321-00", "rg": "7654321", "endereco": "Av. Amostra, 456"}', 'in_review', '2025-05-05 11:22:15.104997');
INSERT INTO douglascars.financing_requests VALUES (9, 'Laura Costa', 'laura@example.com', '(28) 77777-7777', '{"modelo": "Volkswagen Golf", "ano": "2021", "preco": "R$ 95.000,00"}', 'R$ 4.300,00', 'R$ 25.000,00', 24, '{"cpf": "456.789.123-00", "rg": "2345678", "endereco": "Rua Teste, 789"}', 'approved', '2025-05-05 11:22:15.104997');

-- Sequências
SELECT setval('douglascars.brands_id_seq', 56, true);
SELECT setval('douglascars.reviews_id_seq', 14, true);
SELECT setval('douglascars.instagram_posts_id_seq', 29, true);
SELECT setval('douglascars.dealers_id_seq', 5, true);
SELECT setval('douglascars.evaluation_requests_id_seq', 5, true);
SELECT setval('douglascars.financing_requests_id_seq', 9, true);
SELECT setval('douglascars.vehicles_id_seq', 105, true);
SELECT setval('douglascars.vehicle_images_id_seq', 206, true);
SELECT setval('douglascars.hero_slides_id_seq', 3, true);
SELECT setval('douglascars.sales_id_seq', 3, true);
