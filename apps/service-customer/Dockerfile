FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y pnpm-lock.yaml
COPY package*.json ./
COPY apps/service-customer/package*.json ./apps/service-customer/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY apps/service-customer ./apps/service-customer
COPY tsconfig*.json ./

# Construir la aplicación
WORKDIR /app/apps/service-customer
RUN pnpm run build

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar en producción
CMD ["pnpm", "run", "start:prod"] 