FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del servicio
COPY apps/service-customer/package*.json ./apps/service-customer/

# Copiar el paquete compartido de Kafka
COPY packages/shared/kafka/package*.json ./packages/shared/kafka/

# Instalar dependencias del paquete compartido primero
WORKDIR /app/packages/shared/kafka
RUN pnpm install

# Volver al directorio raíz e instalar dependencias del servicio
WORKDIR /app
RUN pnpm install --prefix apps/service-customer

# Copiar código fuente del paquete compartido (excluyendo node_modules)
COPY packages/shared/kafka/src ./packages/shared/kafka/src
COPY packages/shared/kafka/tsconfig*.json ./packages/shared/kafka/

# Construir el paquete compartido
WORKDIR /app/packages/shared/kafka
RUN pnpm run build

# Instalar el paquete compartido localmente en el servicio
WORKDIR /app/apps/service-customer
RUN pnpm install /app/packages/shared/kafka

# Volver al directorio raíz
WORKDIR /app

# Copiar código fuente del servicio (excluyendo node_modules)
COPY apps/service-customer/src ./apps/service-customer/src
COPY apps/service-customer/nest-cli.json ./apps/service-customer/
COPY apps/service-customer/tsconfig*.json ./apps/service-customer/

# Copiar archivos de configuración
COPY tsconfig*.json ./

# Construir la aplicación del servicio
WORKDIR /app/apps/service-customer
RUN pnpm run build

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar en desarrollo
CMD ["pnpm", "run", "start:dev"] 