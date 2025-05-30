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

-- Dados para veículos e outras tabelas serão adicionados aqui

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
