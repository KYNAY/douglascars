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
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.vehicles VALUES (26, 38, '2025 FIAT STRADA RANCH T200', '2025/2025', 'Prata', 150900.00, NULL, 1, 'TESTE DESCRIÇÃO', true, true, 'https://s3.carro57.com.br/FC/6015/6880116_0_B_6087da4700.jpeg', '2025-05-09 13:30:38.037698', 'Automático', 'Flex', 'Picape', 'car', false, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 26, true);


--
-- PostgreSQL database dump complete
--

