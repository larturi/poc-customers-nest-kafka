FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./
COPY apps/service-notifications/package*.json ./apps/service-notifications/

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY apps/service-notifications ./apps/service-notifications
COPY tsconfig*.json ./

# Exponer puerto
EXPOSE 3003

# Comando para ejecutar en desarrollo
CMD ["npm", "run", "start:dev", "--prefix", "apps/service-notifications"] 