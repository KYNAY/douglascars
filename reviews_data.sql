--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.reviews VALUES (10, 'Ronaldo Costa', 'R', 5, 'Ótimo atendimento. Preço justo é as melhores condições. Carros de procedência, revisados e com garantia. RECOMENDO!!', '2025-05-07 00:00:00', '2025-05-07 15:39:29.819897');
INSERT INTO public.reviews VALUES (11, 'João Batista de Oliveira Santos', 'J', 5, 'Ambiente totalmente acolhedor, com excelentes profissionais prontos pra nós dar o atendimento vip que todos nós clientes procuramos na hora de escolher nosso carro!', '2025-05-07 00:00:00', '2025-05-07 15:39:49.566767');
INSERT INTO public.reviews VALUES (12, 'Joao Paulo Barreto', 'J', 5, 'Fomos muito bem recebidos e atendidos. Vendedores atenciosos. Pena que não encontrei o veículo conforme eu estava procurando. Mas recomendo.', '2025-05-07 00:00:00', '2025-05-07 15:40:09.893332');


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 12, true);


--
-- PostgreSQL database dump complete
--

