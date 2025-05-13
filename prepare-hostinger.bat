@echo off
echo Preparando projeto para implantacao na Hostinger...

REM 1. Instalar dependencias
echo Instalando dependencias...
call npm install

REM 2. Construir o projeto
echo Construindo o projeto...
call npm run build

REM 3. Criar arquivo .env.production se nao existir
if not exist .env.production (
  echo Criando arquivo .env.production...
  echo NODE_ENV=production > .env.production
  echo PORT=5000 >> .env.production
  echo HOST=0.0.0.0 >> .env.production
  echo DATABASE_URL=mysql://seu_usuario:sua_senha@localhost:3306/douglascars >> .env.production
  echo IMPORTANTE: Edite o arquivo .env.production com suas credenciais corretas!
) else (
  echo Arquivo .env.production ja existe.
)

REM 4. Criar pasta para arquivos a serem enviados para Hostinger
echo Criando pasta para arquivos de implantacao...
if not exist deploy-hostinger mkdir deploy-hostinger

REM 5. Copiar arquivos necessarios para a pasta de implantacao
echo Copiando arquivos para pasta de implantacao...
xcopy /E /I dist deploy-hostinger\dist
xcopy /E /I node_modules deploy-hostinger\node_modules
copy package.json deploy-hostinger\
copy .env.production deploy-hostinger\.env
xcopy /E /I db deploy-hostinger\db
xcopy /E /I client\public deploy-hostinger\public

echo Projeto preparado para implantacao na pasta 'deploy-hostinger'.
echo IMPORTANTE: Compacte a pasta 'deploy-hostinger' e envie para a Hostinger via FTP.
echo Siga as instrucoes no arquivo HOSTINGER_DEPLOYMENT.md para configurar o ambiente na Hostinger. 