# Configuração do Douglas Auto Car com Dokku

Este guia explica como configurar o projeto Douglas Auto Car em um servidor Dokku, uma alternativa de PaaS (Platform as a Service) leve e open-source semelhante ao Heroku.

## O que é Dokku?

Dokku é uma plataforma de implementação de código aberto e minimalista que permite a implantação de aplicativos com uma experiência similar ao Heroku, mas em seu próprio servidor. É uma ótima opção para quem deseja hospedar aplicativos em seu próprio hardware ou em provedores de infraestrutura como a Digital Ocean, AWS, Linode, etc.

## Pré-requisitos

- Um servidor Linux (Ubuntu 20.04+ recomendado) com pelo menos 1GB RAM
- Um nome de domínio apontando para o servidor
- Acesso SSH ao servidor
- Git instalado no seu computador local

## Parte 1: Instalação do Dokku no Servidor

### 1. Conecte-se ao seu servidor via SSH

```bash
ssh root@seu-servidor-ip
```

### 2. Instale o Dokku

```bash
# Instale as dependências necessárias
apt-get update
apt-get install -y apt-transport-https

# Adicione a chave GPG do Dokku
curl -fsSL https://packagecloud.io/dokku/dokku/gpgkey | sudo apt-key add -

# Adicione o repositório do Dokku
echo "deb https://packagecloud.io/dokku/dokku/ubuntu/ focal main" | sudo tee /etc/apt/sources.list.d/dokku.list

# Atualize e instale o Dokku
apt-get update
apt-get install -y dokku
```

### 3. Configure o Dokku pela web

Acesse `http://seu-servidor-ip` em um navegador e siga as instruções:
- Configure uma chave SSH pública
- Defina o domínio que será usado (exemplo: douglasautocar.com.br)

## Parte 2: Configurando o Aplicativo Douglas Auto Car

### 1. Crie a aplicação no Dokku

No servidor, execute:

```bash
# Crie a aplicação
dokku apps:create douglascars

# Configure o domínio
dokku domains:add douglascars douglasautocar.com.br www.douglasautocar.com.br

# Configure o HTTPS (usando Let's Encrypt)
dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
dokku config:set --no-restart douglascars DOKKU_LETSENCRYPT_EMAIL=seu-email@exemplo.com
dokku letsencrypt:enable douglascars
```

### 2. Configure o Banco de Dados MySQL

```bash
# Instale o plugin MySQL
sudo dokku plugin:install https://github.com/dokku/dokku-mysql.git

# Crie um serviço de banco de dados
dokku mysql:create douglascars-db

# Vincule o banco de dados ao aplicativo
dokku mysql:link douglascars-db douglascars
```

### 3. Configure as Variáveis de Ambiente

```bash
# Configurações gerais
dokku config:set douglascars NODE_ENV=production
dokku config:set douglascars PORT=5000

# Firebase (Autenticação)
dokku config:set douglascars VITE_FIREBASE_API_KEY=seu_api_key_do_firebase
dokku config:set douglascars VITE_FIREBASE_PROJECT_ID=seu_project_id_do_firebase
dokku config:set douglascars VITE_FIREBASE_APP_ID=seu_app_id_do_firebase

# Stripe (Opcional - para pagamentos)
dokku config:set douglascars VITE_STRIPE_PUBLIC_KEY=sua_chave_publica_stripe
dokku config:set douglascars STRIPE_SECRET_KEY=sua_chave_secreta_stripe

# Instagram (Opcional - para integração direta)
dokku config:set douglascars INSTAGRAM_ACCESS_TOKEN=seu_token_de_acesso_instagram
```

### 4. Configure os Requisitos de Recursos

```bash
# Defina a memória disponível para a aplicação (ajuste conforme necessário)
dokku resource:limit --memory 1024m douglascars

# Defina o número de processos web
dokku ps:scale douglascars web=1
```

## Parte 3: Preparação do Projeto para o Dokku

### 1. Adicione os arquivos de configuração do Dokku ao projeto

No diretório raiz do projeto, crie os seguintes arquivos:

**Procfile** - Define como iniciar a aplicação:
```
web: npm run start
```

**app.json** - Descreve a aplicação:
```json
{
  "name": "Douglas Auto Car",
  "description": "Sistema de gerenciamento para Douglas Auto Car",
  "keywords": ["nodejs", "react", "postgres"],
  "repository": "https://github.com/seu-usuario/douglascars",
  "scripts": {
    "dokku": {
      "predeploy": "npm run db:push"
    }
  }
}
```

**.nvmrc** - Define a versão do Node.js:
```
20.10.0
```

### 2. Configure o Repositório Git

No seu computador local, adicione o Dokku como um repositório remoto:

```bash
# No diretório do projeto
git remote add dokku dokku@seu-servidor-ip:douglascars
```

## Parte 4: Implementação (Deployment)

### 1. Faça o Deploy Inicial

```bash
# Commit suas alterações se necessário
git add .
git commit -m "Preparado para deploy no Dokku"

# Envie para o repositório Dokku
git push dokku main
```

Durante o processo de deployment, o Dokku:
1. Detectará automaticamente uma aplicação Node.js
2. Instalará as dependências usando `npm install`
3. Executará o comando de build do package.json
4. Configurará o servidor web
5. Iniciará a aplicação usando o comando do Procfile

### 2. Verifique o Status da Aplicação

```bash
dokku apps:list
dokku ps:report douglascars
```

## Parte 5: Gerenciamento e Manutenção

### 1. Logs da Aplicação

```bash
# Visualizar logs em tempo real
dokku logs douglascars -t

# Visualizar últimos 100 logs
dokku logs douglascars -n 100
```

### 2. Reiniciar a Aplicação

```bash
dokku ps:restart douglascars
```

### 3. Atualizando a Aplicação

Para atualizar, simplesmente faça push das novas alterações:

```bash
git add .
git commit -m "Descreva suas alterações"
git push dokku main
```

### 4. Backups do Banco de Dados

```bash
# Criar um backup
dokku mysql:export douglascars-db > douglascars_backup_$(date +%Y%m%d).sql

# Restaurar um backup
dokku mysql:import douglascars-db < douglascars_backup.sql
```

### 5. Configurando Jobs Agendados (Cron)

```bash
# Instale o plugin de cron
sudo dokku plugin:install https://github.com/dokku/dokku-cron.git

# Adicione um job, por exemplo, para limpeza diária de registros antigos
dokku cron:add douglascars "0 2 * * * node /app/scripts/cleanup.js"
```

## Parte 6: Escalonamento

Se precisar escalonar a aplicação:

```bash
# Aumentar o número de processos web
dokku ps:scale douglascars web=2

# Verificar o escalonamento atual
dokku ps:scale douglascars
```

## Parte 7: Monitoramento

### 1. Instale o plugin de métricas (opcional)

```bash
sudo dokku plugin:install https://github.com/dokku/dokku-graphite.git graphite
dokku graphite:link douglascars
```

Acesse as métricas em `https://douglasautocar.com.br/graphite/`

### 2. Configuração do Healthcheck

```bash
# Configure um healthcheck para garantir que a aplicação está funcionando
dokku checks:add douglascars web http_get / 10 30 1
```

## Parte 8: Solução de Problemas Comuns

### 1. Falha no Build

Se o build falhar, verifique os logs:

```bash
dokku logs douglascars --tail
```

### 2. Problemas de Conexão com o Banco de Dados

Verifique se a variável DATABASE_URL está sendo definida corretamente:

```bash
dokku config:show douglascars
```

### 3. Problemas com Espaço em Disco

Verifique e limpe o armazenamento conforme necessário:

```bash
# Verificar espaço em disco
df -h

# Limpar builds antigos
dokku cleanup
```

### 4. Erros na Aplicação

Verifique os logs e reinicie a aplicação:

```bash
dokku logs douglascars
dokku ps:restart douglascars
```

## Referências Adicionais

- [Documentação oficial do Dokku](http://dokku.viewdocs.io/dokku/)
- [Plugins do Dokku](https://github.com/dokku/dokku/tree/master/plugins)
- [Guia de solução de problemas do Dokku](http://dokku.viewdocs.io/dokku/getting-started/troubleshooting/)

---

© 2025 Douglas Auto Car. Todos os direitos reservados.