# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY yarn.lock ./

# Instalar solo dependencias de producción
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copiar build desde el stage anterior
COPY --from=builder /app/dist ./dist

# Exponer puerto (Railway usa PORT variable)
EXPOSE 3000

# Usuario no-root por seguridad
USER node

# Comando de inicio
CMD ["yarn", "start:prod"]