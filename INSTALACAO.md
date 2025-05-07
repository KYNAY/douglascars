# Guia de Instalação - Douglas Auto Car

Este guia descreve todos os passos necessários para instalar e configurar o sistema Douglas Auto Car em um ambiente independente.

## Requisitos

- Node.js 18+ (recomendado: Node.js 20)
- MySQL ou PostgreSQL (o sistema é compatível com ambos, mas recomendamos MySQL para Hostinger)
- Conta Firebase (para autenticação)
- Conta Stripe (opcional, para pagamentos)
- Conta Instagram (opcional, para integração)

## 1. Configurando o Banco de Dados

### Opção 1: MySQL (Recomendado para Hostinger)

1. Crie um banco de dados chamado `douglascars`
2. Configure um usuário com permissões completas para este banco
3. Anote as credenciais (host, porta, usuário, senha, nome do banco)

### Opção 2: PostgreSQL

1. Crie um banco de dados chamado `douglascars`
2. Configure um usuário com permissões completas para este banco
3. Anote as credenciais (host, porta, usuário, senha, nome do banco)

## 2. Configurando as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Configuração do Banco de Dados (escolha MySQL ou PostgreSQL)
# Para MySQL:
DATABASE_URL=mysql://usuario:senha@host:porta/douglascars

# Para PostgreSQL:
# DATABASE_URL=postgresql://usuario:senha@host:porta/douglascars

# Firebase (Autenticação)
VITE_FIREBASE_API_KEY=seu_api_key_do_firebase
VITE_FIREBASE_PROJECT_ID=seu_project_id_do_firebase
VITE_FIREBASE_APP_ID=seu_app_id_do_firebase

# Stripe (Opcional - para pagamentos)
VITE_STRIPE_PUBLIC_KEY=sua_chave_publica_stripe
STRIPE_SECRET_KEY=sua_chave_secreta_stripe

# Instagram (Opcional - para integração direta)
INSTAGRAM_ACCESS_TOKEN=seu_token_de_acesso_instagram

# Configurações do Servidor
PORT=5000
NODE_ENV=production
```

## 3. Clonando e Configurando o Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/douglascars.git
cd douglascars

# Instale as dependências
npm install

# Atualize o esquema do banco de dados
npm run db:push

# Preencha o banco com dados iniciais
npm run db:seed
```

## 4. Configuração do Firebase (Autenticação)

1. Acesse o [console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto chamado "DouglasAutoCar" (ou outro nome de sua preferência)
3. Na seção "Authentication", ative os métodos de autenticação:
   - Email/Senha
   - Google (opcional)
4. Na seção "Project Settings", clique na opção para adicionar um aplicativo web
5. Registre o aplicativo com o nome "Douglas Auto Car Web"
6. Copie as chaves de configuração para as variáveis de ambiente:
   - `apiKey` → VITE_FIREBASE_API_KEY
   - `projectId` → VITE_FIREBASE_PROJECT_ID
   - `appId` → VITE_FIREBASE_APP_ID
7. Na seção "Authentication" > "Settings" > "Authorized domains", adicione o domínio onde o aplicativo estará hospedado

## 5. Configuração do Stripe (Opcional - para pagamentos)

1. Crie uma conta no [Stripe](https://stripe.com/)
2. No painel administrativo, acesse "Developers" > "API keys"
3. Copie as chaves:
   - Publishable key → VITE_STRIPE_PUBLIC_KEY
   - Secret key → STRIPE_SECRET_KEY

## 6. Configuração do Instagram (Opcional - para integração direta)

1. Crie uma conta de desenvolvedor do Facebook/Instagram
2. Crie um aplicativo no Meta for Developers
3. Configure o Instagram Basic Display API
4. Obtenha um token de acesso de longa duração
5. Configure a variável INSTAGRAM_ACCESS_TOKEN

## 7. Compilação e Execução

```bash
# Para compilar o projeto para produção
npm run build

# Para iniciar o servidor em produção
npm run start
```

## 8. Configuração do Administrador

Ao iniciar o sistema pela primeira vez, você precisará criar um usuário administrador manualmente no banco de dados:

### SQL para MySQL
```sql
INSERT INTO dealers (name, username, email, password, start_date, points, sales, is_admin)
VALUES ('Administrador', 'admin', 'admin@douglasautocar.com', 'senha_criptografada', NOW(), 0, 0, 1);
```

### SQL para PostgreSQL
```sql
INSERT INTO dealers (name, username, email, password, start_date, points, sales, is_admin)
VALUES ('Administrador', 'admin', 'admin@douglasautocar.com', 'senha_criptografada', NOW(), 0, 0, true);
```

**Importante**: Para segurança, a senha deve ser criptografada. O sistema usa bcrypt para criptografia de senhas.

## 9. Estrutura do Banco de Dados

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

### Estrutura das Tabelas

#### brands
- `id` (INT, auto-incremento, chave primária)
- `name` (VARCHAR(255), não nulo)
- `logoUrl` (VARCHAR(255), não nulo)

#### vehicles
- `id` (INT, auto-incremento, chave primária)
- `brandId` (INT, referência para brands.id)
- `model` (VARCHAR(255), não nulo)
- `year` (VARCHAR(50), não nulo)
- `color` (VARCHAR(100), não nulo)
- `price` (DECIMAL(10,2), não nulo)
- `originalPrice` (DECIMAL(10,2), nulo)
- `mileage` (INT, não nulo)
- `transmission` (VARCHAR(50), não nulo)
- `fuel` (VARCHAR(50), não nulo)
- `bodyType` (VARCHAR(50), não nulo)
- `description` (TEXT, nulo)
- `featured` (BOOLEAN, default: false)
- `specialFeatured` (BOOLEAN, default: false)
- `sold` (BOOLEAN, default: false)
- `imageUrl` (VARCHAR(255), não nulo)
- `vehicleType` (VARCHAR(20), default: 'car')
- `createdAt` (TIMESTAMP, default: NOW())
- `updatedAt` (TIMESTAMP, nulo)
- `reservation_expires_at` (TIMESTAMP, nulo)

#### dealers
- `id` (INT, auto-incremento, chave primária)
- `name` (VARCHAR(255), não nulo)
- `username` (VARCHAR(100), não nulo, único)
- `email` (VARCHAR(255), não nulo, único)
- `password` (VARCHAR(255), não nulo)
- `start_date` (DATE, não nulo)
- `points` (INT, default: 0)
- `sales` (INT, default: 0)
- `is_admin` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP, default: NOW())
- `updated_at` (TIMESTAMP, nulo)

#### sales
- `id` (INT, auto-incremento, chave primária)
- `vehicle_id` (INT, referência para vehicles.id)
- `dealer_id` (INT, referência para dealers.id)
- `sale_price` (DECIMAL(10,2), não nulo)
- `sale_date` (TIMESTAMP, default: NOW())
- `commission` (DECIMAL(10,2), nulo)
- `payment_method` (VARCHAR(100), nulo)
- `notes` (TEXT, nulo)
- `cancellation_date` (TIMESTAMP, nulo)

#### reviews
- `id` (INT, auto-incremento, chave primária)
- `name` (VARCHAR(255), não nulo)
- `avatarInitial` (CHAR(1), não nulo)
- `rating` (INT, não nulo)
- `comment` (TEXT, não nulo)
- `date` (DATE, não nulo)
- `created_at` (TIMESTAMP, default: NOW())

#### vehicle_images
- `id` (INT, auto-incremento, chave primária)
- `vehicle_id` (INT, referência para vehicles.id)
- `image_url` (VARCHAR(255), não nulo)
- `is_primary` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP, default: NOW())

#### instagram_posts
- `id` (INT, auto-incremento, chave primária)
- `imageUrl` (VARCHAR(255), não nulo)
- `likes` (INT, default: 0)
- `postUrl` (VARCHAR(255), não nulo)
- `created_at` (TIMESTAMP, default: NOW())

#### hero_slides
- `id` (INT, auto-incremento, chave primária)
- `imageUrl` (VARCHAR(255), não nulo)
- `title` (VARCHAR(255), não nulo)
- `subtitle` (VARCHAR(255), não nulo)
- `order` (INT, default: 0)
- `created_at` (TIMESTAMP, default: NOW())

#### evaluation_requests
- `id` (INT, auto-incremento, chave primária)
- `name` (VARCHAR(255), não nulo)
- `email` (VARCHAR(255), não nulo)
- `phone` (VARCHAR(50), não nulo)
- `vehicleInfo` (TEXT, não nulo)
- `requestDate` (DATE, default: CURRENT_DATE)
- `status` (ENUM('pending', 'contacted', 'completed', 'cancelled'), default: 'pending')
- `notes` (TEXT, nulo)
- `created_at` (TIMESTAMP, default: NOW())

#### financing_requests
- `id` (INT, auto-incremento, chave primária)
- `name` (VARCHAR(255), não nulo)
- `email` (VARCHAR(255), não nulo)
- `phone` (VARCHAR(50), não nulo)
- `vehicleInfo` (TEXT, não nulo)
- `income` (VARCHAR(100), não nulo)
- `requestDate` (DATE, default: CURRENT_DATE)
- `status` (ENUM('pending', 'in_review', 'approved', 'denied'), default: 'pending')
- `notes` (TEXT, nulo)
- `created_at` (TIMESTAMP, default: NOW())

## 10. Hospedagem

### Opção 1: Hostinger (Recomendado)

1. Crie uma conta na Hostinger e contrate um plano que suporte Node.js e MySQL
2. Configure um banco de dados MySQL
3. Faça o upload dos arquivos via FTP ou Git
4. Configure as variáveis de ambiente no painel da Hostinger
5. Configure o domínio e certificado SSL
6. Inicie o servidor através do painel

### Opção 2: Vercel

1. Crie uma conta na Vercel
2. Conecte o repositório GitHub
3. Configure as variáveis de ambiente
4. Defina o comando de build como `npm run build`
5. Defina o comando de inicialização como `npm run start`
6. Configure o domínio

### Opção 3: Railway

1. Crie uma conta no Railway
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente
4. Configure o banco de dados PostgreSQL no Railway
5. Configure o domínio

## 11. Manutenção

### Backup do Banco de Dados

É recomendado fazer backups regulares do banco de dados:

#### Para MySQL
```bash
mysqldump -u usuario -p douglascars > backup_$(date +%Y%m%d).sql
```

#### Para PostgreSQL
```bash
pg_dump -U usuario -W -F p douglascars > backup_$(date +%Y%m%d).sql
```

### Atualizações do Sistema

Para atualizar o sistema:

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

## 12. Contato e Suporte

Para suporte técnico, entre em contato:

- **Email**: contato@douglasautocar.com.br
- **WhatsApp**: (28) 99933-9129
- **Horário de atendimento**: Segunda a Sexta, 07:30 às 18:00 | Sábado, 07:30 às 12:00

---

© 2025 Douglas Auto Car. Todos os direitos reservados.