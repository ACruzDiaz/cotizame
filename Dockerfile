# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar dependencias primero para aprovechar cache
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Generar cliente Prisma y compilar
RUN pnpm prisma:generate
RUN pnpm build

# Etapa final (runtime)
FROM node:20-alpine AS runtime

WORKDIR /app

# Copiar solo lo necesario desde build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# En runtime aplicamos migraciones y seed antes de arrancar
CMD ["sh", "-c", "pnpm prisma:migrate:deploy && pnpm prisma:seed && pnpm start"]
