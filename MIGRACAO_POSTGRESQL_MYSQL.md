# Guia de Migração PostgreSQL para MySQL - Douglas Auto Car

Este documento fornece instruções detalhadas para migrar o banco de dados do sistema Douglas Auto Car de PostgreSQL para MySQL, especialmente ao migrar para a Hostinger que utiliza MySQL.

## 1. Preparação

Antes de iniciar a migração, certifique-se de:

1. Ter acesso ao banco de dados PostgreSQL atual
2. Ter acesso ao novo servidor MySQL na Hostinger
3. Ter instalado as ferramentas necessárias:
   - `pg_dump` - para exportar dados do PostgreSQL
   - Cliente MySQL - para importar dados para o MySQL

## 2. Exportando Dados do PostgreSQL

### 2.1. Exportar o Schema e Dados

```bash
# Conecte-se ao servidor PostgreSQL e exporte o banco completo
pg_dump -U seu_usuario -h seu_host -p sua_porta -d douglascars -f douglascars_dump.sql
```

### 2.2. Ajustes no Arquivo SQL para Compatibilidade com MySQL

O formato SQL do PostgreSQL não é 100% compatível com MySQL. Você precisará fazer algumas modificações no arquivo `douglascars_dump.sql`:

1. Substituir tipos de dados:
   - `boolean` por `tinyint(1)`
   - `text` permanece como `text`
   - `serial` por `int auto_increment`
   - `timestamp` por `datetime`

2. Remover sintaxes específicas do PostgreSQL:
   - Remover `CREATE SCHEMA public;`
   - Remover linhas contendo `SET`
   - Remover linhas contendo `SELECT pg_catalog`
   - Substituir sequências por auto_increment

3. Ajustar sintaxe de chaves estrangeiras

## 3. Criando Estrutura no MySQL

### 3.1. Estrutura Manual MySQL

Aqui está o script para criar manualmente a estrutura no MySQL:

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
  image_url VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) DEFAULT 0,
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

## 4. Importando Dados para MySQL

### 4.1. Exportando Dados como CSV

Uma alternativa ao SQLdump é exportar as tabelas como CSV e importá-las no MySQL:

```bash
# Para cada tabela no PostgreSQL
psql -U usuario -d douglascars -c "COPY brands TO STDOUT WITH CSV HEADER" > brands.csv
psql -U usuario -d douglascars -c "COPY vehicles TO STDOUT WITH CSV HEADER" > vehicles.csv
# Repita para todas as tabelas
```

### 4.2. Importando CSVs no MySQL

```sql
-- Para cada tabela
LOAD DATA INFILE '/caminho/para/brands.csv' 
INTO TABLE brands 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS;

-- Repita para todas as tabelas
```

## 5. Configuração da Aplicação para MySQL

### 5.1. Atualizando a String de Conexão

No arquivo `.env`, atualize a string de conexão do banco de dados:

```
# Altere de:
DATABASE_URL=postgresql://usuario:senha@host:porta/douglascars

# Para:
DATABASE_URL=mysql://usuario:senha@host:porta/douglascars
```

### 5.2. Atualizando as Configurações do Drizzle ORM

1. No arquivo `drizzle.config.ts`, altere o driver para MySQL:

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

2. Atualize o arquivo `db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '@shared/schema';
import mysql from 'mysql2/promise';

// Criar pool de conexões MySQL
const pool = mysql.createPool(process.env.DATABASE_URL);

// Exportar instância do Drizzle
export const db = drizzle(pool, { schema });
```

3. Atualize os imports no arquivo `shared/schema.ts`:

```typescript
// Alterar de:
import { pgTable, serial, text, integer, ... } from 'drizzle-orm/pg-core';

// Para:
import { mysqlTable, int, varchar, text, ... } from 'drizzle-orm/mysql-core';
```

4. Modifique a definição das tabelas para usar a sintaxe MySQL:

```typescript
// Exemplo de conversão
// De:
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logoUrl').notNull(),
});

// Para:
export const brands = mysqlTable('brands', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  logoUrl: varchar('logoUrl', { length: 255 }).notNull(),
});
```

## 6. Execução da Migração

1. Crie o schema no banco MySQL usando o script fornecido
2. Importe os dados usando um dos métodos descritos
3. Atualize a configuração da aplicação para utilizar MySQL
4. Teste a conexão e funcionalidades

## 7. Verificação Pós-Migração

Após a migração, verifique se:

1. Todos os dados foram migrados corretamente
2. Os relacionamentos entre tabelas estão funcionando
3. A aplicação consegue realizar todas as operações CRUD
4. Os sistemas de autenticação e autorização estão funcionando

## 8. Solução de Problemas Comuns

### 8.1. Problemas com Tipos de Dados

- **Boolean**: MySQL não tem um tipo boolean nativo, use `TINYINT(1)` (0 = false, 1 = true)
- **Enum**: A sintaxe de ENUM no MySQL é diferente do PostgreSQL
- **Timestamp**: Em MySQL, use `DATETIME` ou `TIMESTAMP`

### 8.2. Problemas com Chaves Estrangeiras

- MySQL geralmente requer nomes explícitos para chaves estrangeiras
- Verifique a sintaxe ON DELETE e ON UPDATE nas constraints

### 8.3. Problemas com Caracteres Especiais

- Garanta que as tabelas MySQL usem `utf8mb4` como charset para suportar emojis e outros caracteres especiais

## 9. Detalhamento das Diferenças de Sintaxe

### 9.1. Definições de Coluna

| PostgreSQL | MySQL | Notas |
|------------|-------|-------|
| `serial` | `INT AUTO_INCREMENT` | Para IDs auto-incrementais |
| `text` | `TEXT` | Para conteúdo longo |
| `varchar(n)` | `VARCHAR(n)` | Para strings com tamanho limitado |
| `boolean` | `TINYINT(1)` | Para valores true/false |
| `timestamp` | `DATETIME` ou `TIMESTAMP` | Para datas e horas |
| `date` | `DATE` | Para datas |
| `decimal(p,s)` | `DECIMAL(p,s)` | Para valores decimais, onde o schema atual usa precisão 15 e escala 2 para valores monetários |

### 9.2. Definições de Tabela

| PostgreSQL | MySQL | Notas |
|------------|-------|-------|
| `CREATE TABLE nome (...)` | `CREATE TABLE nome (...) ENGINE=InnoDB` | MySQL requer definição de engine |
| Sem charset explícito | `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` | MySQL requer charset explícito |

## 10. Recursos Adicionais

- [Documentação oficial do MySQL](https://dev.mysql.com/doc/)
- [Guia de migração PostgreSQL para MySQL](https://www.convert-in.com/docs/pgs2mys.htm)
- [Tipos de dados MySQL](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)
- [Documentação do Drizzle ORM para MySQL](https://orm.drizzle.team/docs/mysql-schema)

---

© 2025 Douglas Auto Car. Todos os direitos reservados.