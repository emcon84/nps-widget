#!/bin/bash
# Script para ejecutar Prisma Studio con configuración de desarrollo

# Cambiar a Node.js 20
nvm use 20

# Renombrar temporalmente .env para evitar conflictos
if [ -f ".env" ]; then
    mv .env .env.backup
fi

# Copiar .env.local como .env
cp .env.local .env

# Ejecutar Prisma Studio
npx prisma studio

# Restaurar .env original
if [ -f ".env.backup" ]; then
    mv .env.backup .env
fi
