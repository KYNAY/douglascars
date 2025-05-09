# GUIA COMPLETO DE IMPLANTAÇÃO - DOUGLAS AUTO CAR

Este documento unificado contém todas as instruções necessárias para configurar e implantar o sistema Douglas Auto Car em diferentes ambientes de hospedagem, com detalhamento completo de cada opção disponível.

## Índice

1. [Requisitos Técnicos](#1-requisitos-técnicos)
2. [Preparação Inicial e Banco de Dados](#2-preparação-inicial-e-banco-de-dados)
   - [PostgreSQL para MySQL](#21-migrando-de-postgresql-para-mysql)
   - [Esquema e Estrutura do Banco de Dados](#22-esquema-e-estrutura-do-banco-de-dados)
3. [Opções de Implantação](#3-opções-de-implantação)
   - [Hostinger (Recomendado)](#31-hostinger-recomendado)
   - [GitHub + Easypanel](#32-github--easypanel)
   - [Dokku](#33-dokku)
   - [Outras Opções](#34-outras-opções)
4. [Configuração de Domínio](#4-configuração-de-domínio)
5. [Configuração HTTPS/SSL](#5-configuração-httpsssl)
6. [Backup e Manutenção](#6-backup-e-manutenção)
7. [Monitoramento e Otimização](#7-monitoramento-e-otimização)
8. [Solução de Problemas Comuns](#8-solução-de-problemas-comuns)
9. [Informações de Contato e Suporte](#9-informações-de-contato-e-suporte)

---

## 1. Requisitos Técnicos

O sistema Douglas Auto Car foi desenvolvido com as seguintes tecnologias:

- **Frontend**: React + Vite + TypeScript + TailwindCSS + Shadcn/UI
- **Backend**: Node.js (20.x recomendado) + Express
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL (já configurado) ou MySQL (recomendado para Hostinger)
- **Autenticação**: Firebase (necessita de configuração)
- **Integrações opcionais**: Stripe (pagamentos), Instagram (mídias sociais)

### Requisitos de Servidor Mínimos

- **CPU**: 1 vCPU (2+ recomendado para produção)
- **RAM**: 1GB (2GB+ recomendado para produção)
- **Armazenamento**: 10GB SSD
- **Banda**: 1TB/mês
- **Sistema Operacional**: Ubuntu 20.04 LTS ou superior (para opções self-hosted)

---

## 2. Preparação Inicial e Banco de Dados

### 2.1 Migrando de PostgreSQL para MySQL

Se você está movendo o sistema para a Hostinger ou outro provedor que utiliza MySQL, siga estes passos para migrar seu banco de dados.

#### Diferenças entre PostgreSQL e MySQL

| PostgreSQL | MySQL | Notas |
|------------|-------|-------|
| `serial` | `INT AUTO_INCREMENT` | Para IDs auto-incrementais |
| `text` | `TEXT` | Para conteúdo longo |
| `varchar(n)` | `VARCHAR(n)` | Para strings |
| `boolean` | `TINYINT(1)` | 0 = false, 1 = true |
| `timestamp` | `DATETIME` | Para datas e horas |
| `date` | `DATE` | Para datas |
| `decimal(p,s)` | `DECIMAL(p,s)` | Para valores decimais |

#### Passo a Passo da Migração

1. **Exportar dados do PostgreSQL**:
   ```bash
   pg_dump -U seu_usuario -h seu_host -p sua_porta -d douglascars -f douglascars_dump.sql
   ```

2. **Converter o arquivo SQL** para compatibilidade com MySQL:
   - Substitua tipos de dados conforme a tabela acima
   - Remova comandos específicos do PostgreSQL
   - Ajuste a sintaxe de chaves estrangeiras

3. **Criar o banco no MySQL**:
   ```sql
   CREATE DATABASE IF NOT EXISTS douglascars DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Importar os dados**:
   ```bash
   mysql -u usuario -p douglascars < douglascars_dump_convertido.sql
   ```

5. **Atualizar a configuração do Drizzle ORM**:
   - Modifique `drizzle.config.ts`:
     ```typescript
     import { defineConfig } from 'drizzle-kit';
     
     export default defineConfig({
       schema: './shared/schema.ts',
       out: './drizzle',
       driver: 'mysql2', // Alterado de 'pg' para 'mysql2'
       dbCredentials: {
         uri: process.env.DATABASE_URL,
       },
     });
     ```

   - Atualize `db/index.ts`:
     ```typescript
     import { drizzle } from 'drizzle-orm/mysql2';
     import * as schema from '@shared/schema';
     import mysql from 'mysql2/promise';
     
     // Criar pool de conexões MySQL
     const pool = mysql.createPool(process.env.DATABASE_URL);
     
     // Exportar instância do Drizzle
     export const db = drizzle(pool, { schema });
     ```

   - Ajuste o `shared/schema.ts` para usar tipos MySQL:
     ```typescript
     // Alterar de:
     import { pgTable, serial, text... } from 'drizzle-orm/pg-core';
     
     // Para:
     import { mysqlTable, int, varchar, text... } from 'drizzle-orm/mysql-core';
     ```

6. **Atualizar a string de conexão** no arquivo `.env`:
   ```
   # Alterar de:
   DATABASE_URL=postgresql://usuario:senha@host:porta/douglascars
   
   # Para:
   DATABASE_URL=mysql://usuario:senha@host:porta/douglascars
   ```

### 2.2 Esquema e Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas:

1. `brands` - Marcas de veículos
2. `vehicles` - Veículos à venda
3. `dealers` - Vendedores e administradores
4. `sales` - Registro de vendas
5. `reviews` - Avaliações de clientes
6. `vehicle_images` - Imagens adicionais dos veículos
7. `instagram_posts` - Posts do Instagram
8. `hero_slides` - Slides do carrossel principal
9. `evaluation_requests` - Solicitações de avaliação de veículos
10. `financing_requests` - Solicitações de financiamento

Para criar o schema MySQL completo, use o script abaixo:

```sql
-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS douglascars DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE douglascars;

-- Tabela brands
CREATE TABLE brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logoUrl VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela vehicles
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brandId INT,
  model VARCHAR(255) NOT NULL,
  year VARCHAR(50) NOT NULL,
  color VARCHAR(100) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  originalPrice DECIMAL(15,2) NULL,
  mileage INT NOT NULL,
  transmission VARCHAR(50) NOT NULL,
  fuel VARCHAR(50) NOT NULL,
  bodyType VARCHAR(50) NOT NULL,
  description TEXT NULL,
  featured TINYINT(1) DEFAULT 0,
  specialFeatured TINYINT(1) DEFAULT 0,
  sold TINYINT(1) DEFAULT 0,
  imageUrl VARCHAR(255) NOT NULL,
  vehicleType VARCHAR(20) DEFAULT 'car',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NULL,
  reservation_expires_at DATETIME NULL,
  doors VARCHAR(10) NULL,
  enginePower VARCHAR(50) NULL,
  warranty VARCHAR(100) NULL,
  optionals TEXT NULL,
  FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela dealers
CREATE TABLE dealers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  points INT DEFAULT 0,
  sales INT DEFAULT 0,
  is_admin TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela sales
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT,
  dealer_id INT,
  sale_price DECIMAL(15,2) NOT NULL,
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  commission DECIMAL(15,2) NULL,
  payment_method VARCHAR(100) NULL,
  notes TEXT NULL,
  cancellation_date DATETIME NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela reviews
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatarInitial CHAR(1) NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela vehicle_images
CREATE TABLE vehicle_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT,
  imageUrl VARCHAR(255) NOT NULL,
  `order` INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela instagram_posts
CREATE TABLE instagram_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imageUrl VARCHAR(255) NOT NULL,
  likes INT DEFAULT 0,
  postUrl VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela hero_slides
CREATE TABLE hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imageUrl VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL,
  `order` INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela evaluation_requests
CREATE TABLE evaluation_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  vehicleInfo TEXT NOT NULL,
  requestDate DATE DEFAULT (CURRENT_DATE),
  status ENUM('pending', 'contacted', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela financing_requests
CREATE TABLE financing_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  vehicleInfo TEXT NOT NULL,
  income VARCHAR(100) NOT NULL,
  requestDate DATE DEFAULT (CURRENT_DATE),
  status ENUM('pending', 'in_review', 'approved', 'denied') DEFAULT 'pending',
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Nota**: Sempre faça backup dos dados antes de realizar migração ou alterações no banco de dados.

---

## 3. Opções de Implantação

### 3.1 Hostinger (Recomendado)

A Hostinger é a opção recomendada para hospedar o sistema Douglas Auto Car devido a:
- Suporte para Node.js e MySQL
- Data centers no Brasil (menor latência)
- Boa relação custo-benefício
- Interface amigável

#### Passo a Passo de Implantação na Hostinger

1. **Adquira um plano adequado**:
   - Recomendamos plano Business ou Premium
   - Certifique-se de que o plano suporte Node.js

2. **Configuração do Banco de Dados**:
   - No painel da Hostinger, vá para "Banco de Dados" > "MySQL"
   - Crie um novo banco de dados chamado `douglascars`
   - Anote as credenciais: host, usuário, senha

3. **Configuração do Node.js**:
   - No painel, vá para a seção "Websites" > seu domínio
   - Localize a seção "Node.js" e ative
   - Configure:
     - Nome da aplicação: `douglascars`
     - Versão do Node.js: `20.x`
     - Arquivo de início: `server/index.ts`
     - Comando de inicialização: `npm run start`

4. **Configuração das Variáveis de Ambiente**:
   - No painel de Node.js, adicione as variáveis:
     ```
     NODE_ENV=production
     DATABASE_URL=mysql://usuarioDB:senhaDB@hostDB/douglascars
     PORT=5000 (ou a porta fornecida pela Hostinger)
     VITE_FIREBASE_API_KEY=seu_valor
     VITE_FIREBASE_PROJECT_ID=seu_valor
     VITE_FIREBASE_APP_ID=seu_valor
     ```

5. **Upload do Código**:
   - Prepare o projeto: `npm run build`
   - Use FTP para upload (FileZilla, WinSCP)
   - Faça upload para o diretório raiz do site (geralmente `/public_html/`)

6. **Instalação de Dependências**:
   - Conecte-se via SSH se disponível
   - Execute: `npm install --production`

7. **Configuração do Domínio e SSL**:
   - No painel, vá para "Segurança" > "SSL"
   - Instale o certificado Let's Encrypt

8. **Iniciando a Aplicação**:
   - No painel do Node.js, clique em "Restart"
   - Verifique os logs para identificar problemas

9. **Configuração do Usuário Administrador**:
   ```sql
   INSERT INTO dealers (name, username, email, password, start_date, points, sales, is_admin)
   VALUES ('Administrador', 'admin', 'admin@douglasautocar.com.br', 'senha_criptografada', CURDATE(), 0, 0, 1);
   ```

### 3.2 GitHub + Easypanel

Para quem prefere uma solução self-hosted com gerenciamento via UI amigável:

#### Configuração do GitHub

1. **Crie um repositório** no GitHub:
   - Nome: `douglas-auto-car`
   - Descrição: `Sistema de gestão para Douglas Auto Car`
   - Adicione `.gitignore` para Node.js

2. **Configure o repositório local**:
   ```bash
   cd douglascars
   git init
   git remote add origin https://github.com/seu-usuario/douglas-auto-car.git
   git add .
   git commit -m "Commit inicial: Douglas Auto Car"
   git push -u origin main
   ```

#### Implantação no Easypanel

1. **Instale Easypanel** em um servidor Linux:
   ```bash
   sudo mkdir -p /var/lib/easypanel
   sudo docker run -d \
     --name easypanel \
     --privileged \
     -p 80:80 -p 443:443 \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v /var/lib/easypanel:/var/lib/easypanel \
     -e ADMIN_PASSWORD=sua_senha_segura \
     easypanel/easypanel:latest
   ```

2. **Crie um projeto** no Easypanel:
   - Nome: `douglas-auto-car`
   - Domínio: `douglasautocar.com.br`
   - Ative HTTPS

3. **Configure o banco de dados**:
   - Adicione serviço MySQL
   - Nome: `douglascars-db`
   - Defina senhas fortes

4. **Configure a aplicação Node.js**:
   - Adicione serviço NodeJS
   - Nome: `douglascars-app`
   - Repositório Git: URL do seu repositório
   - Branch: `main`
   - Build: `npm install && npm run db:push && npm run build`
   - Start: `npm run start`
   - Porto: `5000`
   - Configure variáveis de ambiente (similares às da Hostinger)

5. **Configure o domínio** conforme instruções da seção 4 deste guia

### 3.3 Dokku

Para quem prefere uma solução similar ao Heroku, mas self-hosted:

1. **Instale Dokku** em um servidor Ubuntu:
   ```bash
   wget https://dokku.com/install/v0.30.9/bootstrap.sh
   sudo DOKKU_TAG=v0.30.9 bash bootstrap.sh
   ```

2. **Crie a aplicação**:
   ```bash
   dokku apps:create douglascars
   dokku domains:add douglascars douglasautocar.com.br www.douglasautocar.com.br
   ```

3. **Configure o banco de dados MySQL**:
   ```bash
   sudo dokku plugin:install https://github.com/dokku/dokku-mysql.git
   dokku mysql:create douglascars-db
   dokku mysql:link douglascars-db douglascars
   ```

4. **Configure variáveis de ambiente**:
   ```bash
   dokku config:set douglascars NODE_ENV=production
   dokku config:set douglascars PORT=5000
   # Adicione outras variáveis necessárias
   ```

5. **Prepare o projeto para deploy**:
   - Crie um arquivo `Procfile`:
     ```
     web: npm run start
     ```
   - Adicione Dokku como remoto Git:
     ```bash
     git remote add dokku dokku@seu-servidor-ip:douglascars
     ```

6. **Faça o deploy**:
   ```bash
   git push dokku main
   ```

7. **Configure SSL**:
   ```bash
   dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
   dokku config:set --no-restart douglascars DOKKU_LETSENCRYPT_EMAIL=seu-email@exemplo.com
   dokku letsencrypt:enable douglascars
   ```

### 3.4 Outras Opções

#### Vercel

1. Importe seu repositório GitHub
2. Configure as variáveis de ambiente
3. Ajuste o arquivo `vercel.json`:
   ```json
   {
     "builds": [
       { "src": "server/index.ts", "use": "@vercel/node" },
       { "src": "client/dist/**", "use": "@vercel/static" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "server/index.ts" },
       { "src": "/(.*)", "dest": "client/dist/$1" }
     ]
   }
   ```

#### Railway

1. Conecte seu repositório GitHub
2. Adicione serviço PostgreSQL
3. Configure variáveis de ambiente
4. Defina comando de build: `npm run build`
5. Defina comando de start: `npm run start`

---

## 4. Configuração de Domínio

### Registrando um Novo Domínio

1. **Escolha um registrador**:
   - [Registro.br](https://registro.br/) - Para domínios .br
   - [Hostinger](https://www.hostinger.com.br/registrar-dominio)
   - [Namecheap](https://www.namecheap.com/)
   - [GoDaddy](https://br.godaddy.com/)

2. **Verifique disponibilidade** e registre o domínio

### Apontando um Domínio Existente

#### Método 1: Alterando Nameservers (recomendado para Hostinger)

1. No painel do registrador, altere os nameservers para os da Hostinger:
   - `ns1.hostinger.com`
   - `ns2.hostinger.com`
   - `ns3.hostinger.com`
   - `ns4.hostinger.com`

2. Aguarde a propagação (pode levar até 48 horas)

#### Método 2: Configurando Registros DNS

Configure os seguintes registros no painel DNS do seu registrador:

| Tipo | Nome | Valor | Propósito |
|------|------|-------|-----------|
| A | `@` | IP_DO_SERVIDOR | Domínio raiz |
| A | `www` | IP_DO_SERVIDOR | Subdomínio www |
| CNAME | `www` | `@` | Alternativa para subdomínio www |
| MX | `@` | Varia conforme serviço de email | Email (opcional) |
| TXT | `@` | Varia conforme serviços | Verificação de domínio |

### Configurações por Plataforma

#### Hostinger
- Vá para "Domínios" > "Meus Domínios" > Selecione seu domínio > "Gerenciar"

#### Dokku
```bash
dokku domains:add douglascars douglasautocar.com.br
dokku domains:add douglascars www.douglasautocar.com.br
```

#### Easypanel
- Acesse seu projeto > "Domains"
- Adicione seu domínio principal e www

#### Vercel/Netlify
- Vá para as configurações de domínio do projeto
- Adicione seu domínio personalizado
- Siga as instruções específicas para DNS

---

## 5. Configuração HTTPS/SSL

O HTTPS é essencial para qualquer site moderno, especialmente para sites que lidam com dados de usuários.

### Hostinger

1. No painel, vá para "Segurança" > "SSL"
2. Clique em "Instalar" para Let's Encrypt SSL
3. Selecione seu domínio e subdomínios
4. Conclua a instalação

### Dokku

```bash
dokku letsencrypt:enable douglascars
```

### Easypanel

1. No projeto, vá para "Domains"
2. Ative "Enable HTTPS" para cada domínio

### Vercel/Netlify

O SSL é configurado automaticamente quando você adiciona um domínio personalizado.

### Verificação de SSL

- Acesse seu site usando HTTPS: `https://douglasautocar.com.br`
- Verifique se o navegador mostra o cadeado de segurança
- Use ferramentas como [SSL Labs](https://www.ssllabs.com/ssltest/) para teste completo

---

## 6. Backup e Manutenção

### Backup do Banco de Dados

#### MySQL (Hostinger)

```bash
# Via painel phpMyAdmin
# Ou via comando:
mysqldump -u usuario -p douglascars > backup_$(date +%Y%m%d).sql
```

#### PostgreSQL

```bash
pg_dump -U usuario -W -F p douglascars > backup_$(date +%Y%m%d).sql
```

### Restauração de Backup

#### MySQL

```bash
mysql -u usuario -p douglascars < backup.sql
```

#### PostgreSQL

```bash
psql -U usuario -d douglascars -f backup.sql
```

### Atualizações do Sistema

```bash
# Atualizar o código fonte
git pull

# Instalar dependências atualizadas
npm install

# Atualizar o esquema do banco (se necessário)
npm run db:push

# Reconstruir para produção
npm run build

# Reiniciar o servidor
npm run start
```

### Manutenção Programada

1. **Agende janelas de manutenção** em horários de baixo tráfego
2. **Comunique aos usuários** sobre manutenções planejadas
3. **Tenha um procedimento de rollback** para cada atualização
4. **Teste todas as alterações** em ambiente de staging antes da produção

---

## 7. Monitoramento e Otimização

### Ferramentas de Monitoramento

1. **Google Analytics** - Para análise de tráfego e comportamento do usuário
2. **Google Search Console** - Para monitorar a indexação no Google
3. **UptimeRobot** - Para monitorar o tempo de atividade do site
4. **Pingdom** - Para monitorar o desempenho e tempo de resposta

### Otimização de Desempenho

1. **Compressão de imagens** - Otimize todas as imagens antes do upload
2. **Caching de API** - Implemente caching para chamadas de API frequentes
3. **Paginação** - Use paginação para grandes conjuntos de dados
4. **Lazy loading** - Carregue imagens e componentes sob demanda

### Otimização de SEO

1. **Meta tags** - Verifique se todas as páginas têm meta tags adequadas
2. **Sitemap** - Gere e envie um sitemap.xml para o Google
3. **URLs amigáveis** - Use URLs descritivas e fáceis de ler
4. **Conteúdo responsivo** - Garanta que o site seja otimizado para dispositivos móveis

---

## 8. Solução de Problemas Comuns

### O site não carrega

- Verifique se o servidor Node.js está em execução
- Verifique se o banco de dados está acessível
- Verifique os logs do servidor para erros específicos
- Teste a conectividade de rede ao servidor

### Problemas de Banco de Dados

- Verifique a string de conexão no arquivo `.env`
- Verifique as credenciais do banco de dados
- Execute `npm run db:push` para atualizar o esquema
- Verifique o espaço em disco e limites de conexão

### Erro 500 (Internal Server Error)

- Analise os logs do servidor para identificar a causa
- Verifique erros na API ou banco de dados
- Verifique configurações de ambiente

### Certificado SSL não funciona

- Verifique a configuração de DNS
- Reinstale o certificado SSL
- Verifique se o servidor web está configurado para HTTPS

---

## 9. Informações de Contato e Suporte

### Contato Douglas Auto Car

- **Email**: contato@douglasautocar.com.br
- **WhatsApp**: (28) 99933-9129
- **Telefone**: (28) 3027-7065
- **Endereço**: Av. Aristídes Campos, 449/451, Gilberto Machado, Cachoeiro de Itapemirim/ES
- **CEP**: 29302-801
- **Horário de atendimento**: Segunda a Sexta, 07:30 às 18:00 | Sábado, 07:30 às 12:00

### Links Úteis

- [Documentação Docker](https://docs.docker.com/)
- [Documentação Node.js](https://nodejs.org/en/docs/)
- [Documentação MySQL](https://dev.mysql.com/doc/)
- [Documentação Firebase](https://firebase.google.com/docs)
- [Documentação da Hostinger](https://www.hostinger.com.br/tutoriais)

---

## Conclusão

Este guia completo abrange todos os aspectos necessários para implantar e manter o sistema Douglas Auto Car em diversas plataformas de hospedagem. Escolha a opção que melhor atende às suas necessidades e siga as instruções detalhadas para cada etapa do processo.

---

© 2025 Douglas Auto Car. Todos os direitos reservados.

Data da última atualização: 09 de maio de 2025.