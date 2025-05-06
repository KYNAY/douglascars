FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar o código fonte
COPY . .

# Construir o aplicativo
RUN npm run build

# Configurar porta e iniciar o servidor
ENV PORT=3000
ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "dist/index.js"]