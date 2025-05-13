# Adaptação do Código para o Supabase com Schema Douglascars

Após importar o banco de dados para o Supabase com o schema `douglascars`, serão necessárias algumas pequenas adaptações no código do projeto. Veja abaixo as principais alterações:

## 1. Configuração da Conexão

No arquivo `db/index.ts`, adicione a opção schema ao drizzle:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema, schemas: { douglascars: true } });
```

## 2. Atualização do Schema

Em `shared/schema.ts`, atualize a definição das tabelas para incluir o schema:

```typescript
import { pgTable, serial, text, integer, timestamp, decimal, pgSchema } from 'drizzle-orm/pg-core';
// outros imports...

// Define o schema douglascars
const douglascars = pgSchema('douglascars');

// Exemplo de uma tabela com o schema
export const brands = douglascars.table('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logoUrl').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull()
});

// Siga o mesmo padrão para as outras tabelas
export const vehicles = douglascars.table('vehicles', {
  // definições da tabela...
});
```

## 3. Configuração do drizzle.config.ts

Atualize o arquivo `drizzle.config.ts` para incluir o schema:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
  schema: 'douglascars', // Adicione esta linha
} satisfies Config;
```

## 4. Ajustes nas Consultas

As consultas já estão automaticamente adaptadas ao schema, desde que você use as referências de tabela importadas do schema:

```typescript
import { eq } from 'drizzle-orm';
import { db } from '@db';
import { vehicles, brands } from '@shared/schema';

// A consulta já vai considerar o schema 'douglascars'
const featuredVehicles = await db.query.vehicles.findMany({
  where: eq(vehicles.featured, true),
  with: {
    brand: true,
  },
});
```

## Importante

1. Não esqueça de atualizar a URL do banco de dados nas variáveis de ambiente:
   ```
   DATABASE_URL=postgresql://postgres:[SEU_PASSWORD]@[HOST]:5432/postgres
   ```

2. Teste as consultas no console do Supabase usando o schema completo:
   ```sql
   SELECT * FROM douglascars.vehicles;
   ```

3. Para novas migrations, execute:
   ```
   npm run db:push
   ```
   Isso atualizará o schema no Supabase mantendo a estrutura existente.