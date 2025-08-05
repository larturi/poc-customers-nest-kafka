#!/bin/bash

# POC Customers Nest Kafka - Setup Script
# Este script instala y configura todo el proyecto

set -e

echo "🚀 Iniciando setup del POC Customers Nest Kafka..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
print_status "Verificando prerrequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión 18+ es requerida. Versión actual: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_success "npm $(npm -v) encontrado"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker no está instalado. Necesitarás instalarlo para ejecutar Kafka"
else
    print_success "Docker $(docker --version) encontrado"
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose no está instalado. Necesitarás instalarlo para ejecutar Kafka"
else
    print_success "Docker Compose $(docker-compose --version) encontrado"
fi

print_status "Prerrequisitos verificados ✅"

# Construir el paquete compartido de Kafka
print_status "Construyendo paquete compartido de Kafka..."

cd packages/shared/kafka

if [ ! -f "package.json" ]; then
    print_error "package.json no encontrado en packages/shared/kafka"
    exit 1
fi

print_status "Instalando dependencias del paquete compartido..."
npm install

print_status "Construyendo paquete compartido..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Paquete compartido construido exitosamente"
else
    print_error "Error construyendo el paquete compartido"
    exit 1
fi

cd ../../

# Instalar dependencias de los servicios
print_status "Instalando dependencias de los servicios..."

SERVICES=("service-customer" "service-profiling" "service-notifications")

for service in "${SERVICES[@]}"; do
    print_status "Instalando dependencias de $service..."
    cd "apps/$service"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json no encontrado en apps/$service"
        exit 1
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencias de $service instaladas"
    else
        print_error "Error instalando dependencias de $service"
        exit 1
    fi
    
    cd ../../
done

print_success "Todas las dependencias instaladas ✅"

# Verificar que Kafka esté disponible
print_status "Verificando Kafka..."

if command -v docker-compose &> /dev/null; then
    print_status "Iniciando Kafka con Docker Compose..."
    docker-compose -f docker-compose.kafka.yml up -d
    
    if [ $? -eq 0 ]; then
        print_success "Kafka iniciado exitosamente"
        
        # Esperar un poco para que Kafka se inicialice
        print_status "Esperando que Kafka se inicialice..."
        sleep 10
        
        # Verificar que Kafka esté corriendo
        if docker-compose -f docker-compose.kafka.yml ps | grep -q "Up"; then
            print_success "Kafka está corriendo correctamente"
        else
            print_warning "Kafka podría no estar completamente inicializado"
        fi
    else
        print_warning "Error iniciando Kafka. Puedes iniciarlo manualmente con: docker-compose -f docker-compose.kafka.yml up -d"
    fi
else
    print_warning "Docker Compose no disponible. Inicia Kafka manualmente con: docker-compose -f docker-compose.kafka.yml up -d"
fi

# Mostrar información final
echo ""
print_success "🎉 Setup completado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Inicia los servicios (en terminales separadas):"
echo "   Terminal 1: cd apps/service-customer && npm run start:dev"
echo "   Terminal 2: cd apps/service-profiling && npm run start:dev"
echo "   Terminal 3: cd apps/service-notifications && npm run start:dev"
echo ""
echo "2. Verifica que Kafka esté corriendo:"
echo "   docker-compose -f docker-compose.kafka.yml ps"
echo ""
echo "3. Accede a Kafka UI:"
echo "   http://localhost:8080"
echo ""
echo "4. Prueba los endpoints:"
echo "   curl -X POST http://localhost:3001/customers/onboard \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"name\":\"Juan Pérez\",\"email\":\"juan@example.com\",\"phone\":\"+1234567890\"}'"
echo ""
echo "📚 Para más información, consulta el README.md"
echo "" 