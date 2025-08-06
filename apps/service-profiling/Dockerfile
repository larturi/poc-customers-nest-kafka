FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del servicio
COPY apps/service-profiling/package*.json ./apps/service-profiling/

# Copiar el paquete compartido de Kafka
COPY packages/shared/kafka/package*.json ./packages/shared/kafka/

# Instalar dependencias del paquete compartido primero
WORKDIR /app/packages/shared/kafka
RUN pnpm install

# Volver al directorio raíz e instalar dependencias del servicio
WORKDIR /app
RUN pnpm install --prefix apps/service-profiling

# Copiar código fuente del paquete compartido (excluyendo node_modules)
COPY packages/shared/kafka/src ./packages/shared/kafka/src
COPY packages/shared/kafka/tsconfig*.json ./packages/shared/kafka/

# Construir el paquete compartido
WORKDIR /app/packages/shared/kafka
RUN pnpm run build

# Instalar el paquete compartido localmente en el servicio
WORKDIR /app/apps/service-profiling
RUN pnpm install /app/packages/shared/kafka

# Volver al directorio raíz
WORKDIR /app

# Copiar código fuente del servicio (excluyendo node_modules)
COPY apps/service-profiling/src ./apps/service-profiling/src
COPY apps/service-profiling/nest-cli.json ./apps/service-profiling/
COPY apps/service-profiling/tsconfig*.json ./apps/service-profiling/

# Copiar archivos de configuración
COPY tsconfig*.json ./

# Construir la aplicación del servicio
WORKDIR /app/apps/service-profiling
RUN pnpm run build

# Exponer puerto
EXPOSE 3002

# Comando para ejecutar en desarrollo
CMD ["pnpm", "run", "start:dev"] 