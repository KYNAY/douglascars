#!/bin/bash

# Script para preparar o projeto Douglas Auto Car para implantação na Hostinger

echo "Preparando projeto para implantação na Hostinger..."

# 1. Instalar dependências
echo "Instalando dependências..."
npm install

# 2. Construir o projeto
echo "Construindo o projeto..."
npm run build

# 3. Criar arquivo .env.production se não existir
if [ ! -f .env.production ]; then
  echo "Criando arquivo .env.production..."
  echo "NODE_ENV=production" > .env.production
  echo "PORT=5000" >> .env.production
  echo "HOST=0.0.0.0" >> .env.production
  echo "DATABASE_URL=mysql://seu_usuario:sua_senha@localhost:3306/douglascars" >> .env.production
  echo "IMPORTANTE: Edite o arquivo .env.production com suas credenciais corretas!"
else
  echo "Arquivo .env.production já existe."
fi

# 4. Criar pasta para arquivos a serem enviados para Hostinger
echo "Criando pasta para arquivos de implantação..."
mkdir -p deploy-hostinger

# 5. Copiar arquivos necessários para a pasta de implantação
echo "Copiando arquivos para pasta de implantação..."
cp -r dist deploy-hostinger/
cp -r node_modules deploy-hostinger/
cp package.json deploy-hostinger/
cp .env.production deploy-hostinger/.env
cp -r db deploy-hostinger/
cp -r client/public deploy-hostinger/public

echo "Projeto preparado para implantação na pasta 'deploy-hostinger'."
echo "IMPORTANTE: Compacte a pasta 'deploy-hostinger' e envie para a Hostinger via FTP."
echo "Siga as instruções no arquivo HOSTINGER_DEPLOYMENT.md para configurar o ambiente na Hostinger." 