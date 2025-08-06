FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del servicio
COPY apps/service-notifications/package*.json ./apps/service-notifications/

# Copiar el paquete compartido de Kafka
COPY packages/shared/kafka/package*.json ./packages/shared/kafka/

# Instalar dependencias del paquete compartido primero
WORKDIR /app/packages/shared/kafka
RUN pnpm install

# Volver al directorio raíz e instalar dependencias del servicio
WORKDIR /app
RUN pnpm install --prefix apps/service-notifications

# Copiar código fuente del paquete compartido (excluyendo node_modules)
COPY packages/shared/kafka/src ./packages/shared/kafka/src
COPY packages/shared/kafka/tsconfig*.json ./packages/shared/kafka/

# Construir el paquete compartido
WORKDIR /app/packages/shared/kafka
RUN pnpm run build

# Instalar el paquete compartido localmente en el servicio
WORKDIR /app/apps/service-notifications
RUN pnpm install /app/packages/shared/kafka

# Volver al directorio raíz
WORKDIR /app

# Copiar código fuente del servicio (excluyendo node_modules)
COPY apps/service-notifications/src ./apps/service-notifications/src
COPY apps/service-notifications/nest-cli.json ./apps/service-notifications/
COPY apps/service-notifications/tsconfig*.json ./apps/service-notifications/

# Copiar archivos de configuración
COPY tsconfig*.json ./

# Construir la aplicación del servicio
WORKDIR /app/apps/service-notifications
RUN pnpm run build

# Exponer puerto
EXPOSE 3003

# Comando para ejecutar en desarrollo
CMD ["pnpm", "run", "start:dev"] 