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
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.brands VALUES (33, 'BMW', 'https://static.autoconf.com.br/marcas/bmw.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (34, 'BYD', 'https://static.autoconf.com.br/marcas/byd.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (35, 'CHERY', 'https://static.autoconf.com.br/marcas/chery.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (36, 'Chevrolet', 'https://static.autoconf.com.br/marcas/gm-chevrolet.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (37, 'Citroën', 'https://static.autoconf.com.br/marcas/citroen.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (38, 'Fiat', 'https://static.autoconf.com.br/marcas/fiat.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (39, 'Ford', 'https://static.autoconf.com.br/marcas/ford.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (40, 'Honda', 'https://static.autoconf.com.br/marcas/honda.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (41, 'Hyundai', 'https://static.autoconf.com.br/marcas/hyundai.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (42, 'Jeep', 'https://static.autoconf.com.br/marcas/jeep.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (43, 'Nissan', 'https://static.autoconf.com.br/marcas/nissan.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (44, 'Peugeot', 'https://static.autoconf.com.br/marcas/peugeot.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (45, 'Renault', 'https://static.autoconf.com.br/marcas/renault.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (46, 'Toyota', 'https://static.autoconf.com.br/marcas/toyota.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (47, 'Volkswagen', 'https://static.autoconf.com.br/marcas/vw-volkswagen.png', '2025-05-05 11:22:15.104997');
INSERT INTO public.brands VALUES (48, 'YAMAHA', 'https://static.autoconf.com.br/marcas/yamaha.png', '2025-05-05 11:22:15.104997');


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_id_seq', 49, true);


--
-- PostgreSQL database dump complete
--

