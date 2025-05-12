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
-- Name: evaluation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evaluation_status AS ENUM (
    'pending',
    'contacted',
    'completed',
    'cancelled'
);


--
-- Name: financing_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.financing_status AS ENUM (
    'pending',
    'in_review',
    'approved',
    'denied'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name text NOT NULL,
    logo_url text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: dealers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dealers (
    id integer NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    points integer DEFAULT 0,
    sales integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email text
);


--
-- Name: dealers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dealers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dealers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dealers_id_seq OWNED BY public.dealers.id;


--
-- Name: evaluation_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluation_requests (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    vehicle_info text NOT NULL,
    request_date timestamp without time zone DEFAULT now() NOT NULL,
    status public.evaluation_status DEFAULT 'pending'::public.evaluation_status NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: evaluation_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.evaluation_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: evaluation_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.evaluation_requests_id_seq OWNED BY public.evaluation_requests.id;


--
-- Name: financing_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financing_requests (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    vehicle_info text NOT NULL,
    income text NOT NULL,
    request_date timestamp without time zone DEFAULT now() NOT NULL,
    status public.financing_status DEFAULT 'pending'::public.financing_status NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: financing_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.financing_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: financing_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.financing_requests_id_seq OWNED BY public.financing_requests.id;


--
-- Name: hero_slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_slides (
    id integer NOT NULL,
    image_url text NOT NULL,
    title text NOT NULL,
    subtitle text NOT NULL,
    "order" integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: hero_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hero_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hero_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hero_slides_id_seq OWNED BY public.hero_slides.id;


--
-- Name: instagram_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instagram_posts (
    id integer NOT NULL,
    image_url text NOT NULL,
    likes integer DEFAULT 0,
    post_url text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: instagram_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.instagram_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: instagram_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.instagram_posts_id_seq OWNED BY public.instagram_posts.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    name text NOT NULL,
    avatar_initial text NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    vehicle_id integer NOT NULL,
    dealer_id integer NOT NULL,
    sale_date timestamp without time zone DEFAULT now() NOT NULL,
    sale_price numeric(10,2) NOT NULL,
    cancelled boolean DEFAULT false,
    cancellation_date timestamp without time zone,
    points_awarded integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: vehicle_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_images (
    id integer NOT NULL,
    vehicle_id integer NOT NULL,
    image_url text NOT NULL,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vehicle_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicle_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicle_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicle_images_id_seq OWNED BY public.vehicle_images.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    brand_id integer NOT NULL,
    model text NOT NULL,
    year text NOT NULL,
    color text NOT NULL,
    price numeric(15,2) NOT NULL,
    original_price numeric(15,2),
    mileage integer NOT NULL,
    description text,
    featured boolean DEFAULT false,
    sold boolean DEFAULT false,
    image_url text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    transmission text DEFAULT 'Manual'::text,
    fuel text DEFAULT 'Flex'::text,
    body_type text,
    vehicle_type text DEFAULT 'car'::text,
    reserved boolean DEFAULT false,
    reserved_by integer,
    reservation_time timestamp without time zone,
    reservation_expires_at timestamp without time zone,
    special_featured boolean DEFAULT false,
    doors integer,
    engine_power text,
    engine_torque text,
    warranty text,
    optionals text
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: dealers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers ALTER COLUMN id SET DEFAULT nextval('public.dealers_id_seq'::regclass);


--
-- Name: evaluation_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_requests ALTER COLUMN id SET DEFAULT nextval('public.evaluation_requests_id_seq'::regclass);


--
-- Name: financing_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financing_requests ALTER COLUMN id SET DEFAULT nextval('public.financing_requests_id_seq'::regclass);


--
-- Name: hero_slides id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides ALTER COLUMN id SET DEFAULT nextval('public.hero_slides_id_seq'::regclass);


--
-- Name: instagram_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instagram_posts ALTER COLUMN id SET DEFAULT nextval('public.instagram_posts_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: vehicle_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_images ALTER COLUMN id SET DEFAULT nextval('public.vehicle_images_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: dealers dealers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_pkey PRIMARY KEY (id);


--
-- Name: dealers dealers_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_username_unique UNIQUE (username);


--
-- Name: evaluation_requests evaluation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_requests
    ADD CONSTRAINT evaluation_requests_pkey PRIMARY KEY (id);


--
-- Name: financing_requests financing_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financing_requests
    ADD CONSTRAINT financing_requests_pkey PRIMARY KEY (id);


--
-- Name: hero_slides hero_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides
    ADD CONSTRAINT hero_slides_pkey PRIMARY KEY (id);


--
-- Name: instagram_posts instagram_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instagram_posts
    ADD CONSTRAINT instagram_posts_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: vehicle_images vehicle_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_images
    ADD CONSTRAINT vehicle_images_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: sales sales_dealer_id_dealers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_dealer_id_dealers_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers(id);


--
-- Name: sales sales_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicle_images vehicle_images_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_images
    ADD CONSTRAINT vehicle_images_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicles vehicles_brand_id_brands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_brand_id_brands_id_fk FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- PostgreSQL database dump complete
--

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
-- Data for Name: instagram_posts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.instagram_posts VALUES (19, 'https://kiing.link/uploads/files/d946512ffc4b0220985b0bde26c8ad93.jpg', 32, 'https://www.instagram.com/douglas.autocar/', '2025-05-07 15:30:04.626144');
INSERT INTO public.instagram_posts VALUES (20, 'https://kiing.link/uploads/files/63bc935a52ebaadc4cea71027b220695.jpg', 50, 'https://www.instagram.com/douglas.autocar/', '2025-05-07 15:30:20.761121');
INSERT INTO public.instagram_posts VALUES (21, 'https://kiing.link/uploads/files/406d43302047ee69ed661b652b60ab2f.jpg', 25, 'https://www.instagram.com/douglas.autocar/', '2025-05-07 15:30:39.974654');
INSERT INTO public.instagram_posts VALUES (22, 'https://kiing.link/uploads/files/eacb9c83382d643762a605e0ed878b9d.jpg', 47, 'https://www.instagram.com/douglas.autocar/', '2025-05-07 15:30:58.422317');
INSERT INTO public.instagram_posts VALUES (23, 'https://kiing.link/uploads/files/301491a85ba71dcca891c3f3493c5b1b.jpg', 43, 'https://www.instagram.com/douglas.autocar/', '2025-05-07 15:31:13.492926');
INSERT INTO public.instagram_posts VALUES (24, 'https://kiing.link/uploads/files/23343ffc8f5694cf11e9d91b6f7f58d2.jpg', 29, 'https://www.instagram.com/douglas.autocar/', '2025-05-07 15:31:30.847642');


--
-- Name: instagram_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.instagram_posts_id_seq', 24, true);


--
-- PostgreSQL database dump complete
--

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
-- Data for Name: vehicle_images; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: vehicle_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicle_images_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

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
-- Data for Name: evaluation_requests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.evaluation_requests VALUES (3, 'Caique Contarini', 'caiquewm@gmail.com', '27996098863', 'gol gti 2010, preto, flex', '2025-05-08 18:43:35.514112', 'pending', 'teste', '2025-05-08 18:43:35.514112');


--
-- Name: evaluation_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.evaluation_requests_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

