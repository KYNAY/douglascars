# Configuração do Douglas Auto Car no GitHub e Easypanel

Este guia vai instruir como configurar o projeto Douglas Auto Car para controle de versão no GitHub e como implantar a aplicação usando o Easypanel.

## Parte 1: Configuração no GitHub

### 1. Criando um repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login na sua conta
2. Clique no botão "New" (Novo) para criar um repositório
3. Preencha as informações:
   - Nome do repositório: `douglas-auto-car`
   - Descrição: `Sistema de gestão para Douglas Auto Car`
   - Visibilidade: Escolha entre "Public" (Público) ou "Private" (Privado)
   - Inicialize o repositório com:
     - [x] Add a README file
     - [x] Add .gitignore (selecione Node)
     - [x] Choose a license (opcional)
4. Clique em "Create repository" (Criar repositório)

### 2. Configurando o projeto local para o GitHub

```bash
# No diretório do projeto
cd douglascars

# Se o projeto ainda não tiver um repositório git
git init

# Adicione o repositório remoto do GitHub
git remote add origin https://github.com/seu-usuario/douglas-auto-car.git

# Crie um arquivo .gitignore apropriado
cat > .gitignore << EOL
# Dependências
node_modules/
.pnp
.pnp.js

# Arquivos de build
dist/
build/
.next/
out/

# Variáveis de ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor/IDE
.idea/
.vscode/
*.swp
*.swo

# Sistema operacional
.DS_Store
Thumbs.db

# Arquivos temporários
tmp/
temp/
EOL

# Prepare o commit inicial (se estiver iniciando um novo repositório)
git add .
git commit -m "Commit inicial: Douglas Auto Car"

# Envie para o GitHub (use 'main' ou 'master' dependendo de como você configurou)
git push -u origin main
```

### 3. Configurando Fluxo de Trabalho com Branches

Recomendamos usar o modelo GitFlow para gerenciar o código:

```bash
# Branches principais
git branch -M main            # Branch principal (código em produção)
git branch -b develop         # Branch de desenvolvimento

# Para cada nova funcionalidade
git checkout -b feature/nome-da-funcionalidade develop

# Ao terminar a feature
git checkout develop
git merge --no-ff feature/nome-da-funcionalidade
git push origin develop

# Para lançamentos
git checkout -b release/v1.0.0 develop
# (faça ajustes finais)
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Versão 1.0.0"
git push origin main --tags
```

### 4. Configurando GitHub Actions (CI/CD)

Crie um arquivo de workflow para GitHub Actions:

```bash
mkdir -p .github/workflows
```

Crie um arquivo para CI/CD básico:

```yaml
# .github/workflows/main.yml
name: Douglas Auto Car CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
```

## Parte 2: Configuração no Easypanel

Easypanel é uma plataforma self-hosted para hospedagem de aplicações baseada em Docker, similar ao Heroku, mas executada em seu próprio servidor.

### 1. Instalação do Easypanel no Servidor

Antes de configurar sua aplicação, você precisa ter o Easypanel instalado no servidor.

```bash
# Instale Easypanel em uma máquina Linux com Docker
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

Acesse o Easypanel através do navegador: `http://seu-servidor-ip`

### 2. Configurando um novo projeto no Easypanel

1. Faça login no Easypanel com suas credenciais de administrador
2. Na interface do Easypanel, clique em "Projects" (Projetos) e depois em "New Project" (Novo Projeto)
3. Preencha as informações do projeto:
   - Nome: `douglas-auto-car`
   - Domínio: `douglasautocar.com.br` (ou o domínio que você possui)
   - Selecione "Enable HTTPS" para habilitar HTTPS

### 3. Adicionando o Banco de Dados

1. No seu projeto, vá para a aba "Services" (Serviços)
2. Clique em "New Service" (Novo Serviço)
3. Selecione "MySQL" (ou PostgreSQL, dependendo da sua preferência)
4. Configure o banco de dados:
   - Service name: `douglascars-db`
   - MySQL version: Escolha a versão mais recente estável (ex: 8.0)
   - Root password: Crie uma senha forte
   - Database name: `douglascars`
   - Database user: `douglasuser`
   - Database password: Crie outra senha forte
5. Clique em "Create Service" (Criar Serviço)

### 4. Configurando a Aplicação Node.js

1. No seu projeto, vá para a aba "Services" (Serviços) novamente
2. Clique em "New Service" (Novo Serviço)
3. Selecione "NodeJS"
4. Configure a aplicação:
   - Service name: `douglascars-app`
   - Git repository: `https://github.com/seu-usuario/douglas-auto-car.git`
   - Branch: `main`
   - Build command: `npm install && npm run db:push && npm run build`
   - Start command: `npm run start`
   - Auto deploy: Ative se desejar deploy automático
   - Port: `5000`

5. Configure variáveis de ambiente clicando em "Environment Variables" (Variáveis de Ambiente):
   - `DATABASE_URL`: `mysql://douglasuser:senha@douglascars-db:3306/douglascars`
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `VITE_FIREBASE_API_KEY`: `seu_api_key_do_firebase`
   - `VITE_FIREBASE_PROJECT_ID`: `seu_project_id_do_firebase`
   - `VITE_FIREBASE_APP_ID`: `seu_app_id_do_firebase`
   - Adicione outras variáveis necessárias (Stripe, Instagram, etc.)

6. Se necessário, configure recursos de hardware:
   - Memory: 1-2 GB RAM dependendo do tamanho da aplicação
   - CPU: 1 CPU é geralmente suficiente para começar

7. Clique em "Create Service" (Criar Serviço)

### 5. Configuração de Domínio e SSL

1. No seu projeto, vá para a aba "Domains" (Domínios)
2. Para o domínio principal:
   - Verifique se o domínio já está listado (douglasautocar.com.br)
   - Se não estiver, clique em "Add Domain" (Adicionar Domínio)
   - Digite o domínio: `douglasautocar.com.br`
   - Habilite SSL marcando "Enable HTTPS"

3. Aponte o DNS do seu domínio para o IP do servidor Easypanel:
   - Crie um registro A no seu provedor de DNS:
     - Host: `@` (ou deixe em branco para o domínio raiz)
     - Valor: `IP_DO_SEU_SERVIDOR`
   - Para o subdomínio www, crie outro registro A ou um registro CNAME:
     - Host: `www`
     - Valor: `IP_DO_SEU_SERVIDOR` (para registro A) ou `douglasautocar.com.br` (para CNAME)

4. Aguarde a propagação do DNS (pode levar até 48 horas, mas geralmente é mais rápido)

### 6. Monitoramento e Logs

1. Monitorando sua aplicação:
   - No Easypanel, vá para o serviço `douglascars-app`
   - Na aba "Metrics" você pode ver o uso de CPU, memória e outros recursos
   - Na aba "Logs" você pode ver os logs da aplicação em tempo real

2. Configure alertas (se disponível na sua versão do Easypanel):
   - Vá para as configurações do serviço
   - Configure alertas para alto uso de CPU ou memória
   - Configure notificações por email

### 7. Backups

1. Backup do banco de dados:
   - No Easypanel, vá para o serviço `douglascars-db`
   - Clique na aba "Backups" (se disponível)
   - Configure backups automáticos ou realize backups manuais

2. Backup manual do banco de dados:
   - Acesse o servidor através de SSH
   - Execute um comando para backup:
   ```bash
   sudo docker exec -it douglascars-db mysqldump -u root -p douglascars > /var/backups/douglascars_$(date +%Y%m%d).sql
   ```

### 8. CI/CD Avançado com GitHub e Easypanel

Para um fluxo de CI/CD mais avançado, você pode configurar webhooks ou usar o GitHub Actions para acionar builds automaticamente:

1. No Easypanel, vá para o serviço `douglascars-app`
2. Em "Settings" > "Repository" verifique se "Auto Deploy" está ativado
3. Copie o webhook URL se disponível

4. No GitHub, vá para o repositório:
   - Acesse "Settings" > "Webhooks"
   - Adicione um novo webhook com a URL fornecida pelo Easypanel
   - Selecione os eventos que devem acionar o webhook (geralmente push para main)

## Parte 3: Manutenção Contínua

### 1. Atualizações do Código

```bash
# Para atualizar o código local
git pull origin main

# Para enviar atualizações
git add .
git commit -m "Descreva suas alterações"
git push origin main
```

### 2. Monitoramento de Desempenho

1. Acesse regularmente o painel de métricas no Easypanel
2. Verifique os logs para identificar problemas
3. Configure o monitoramento externo (como UptimeRobot ou Pingdom) para verificar a disponibilidade do site

### 3. Atualizações de Segurança

1. Mantenha o NodeJS e pacotes npm atualizados:
   ```bash
   npm outdated
   npm update
   ```

2. Verifique regularmente atualizações do Easypanel e Docker:
   ```bash
   docker pull easypanel/easypanel:latest
   ```

## Referências Adicionais

- [Documentação oficial do GitHub](https://docs.github.com/)
- [Documentação do Easypanel](https://easypanel.io/docs)
- [Guia de boas práticas para NodeJS em produção](https://expressjs.com/en/advanced/best-practice-performance.html)

---

© 2025 Douglas Auto Car. Todos os direitos reservados.