# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
# Copiar dependencias primero para aprovechar cache
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build 

# Etapa final (runtime)
FROM node:20-alpine AS runtime

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
# Copiar solo lo necesario desde build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts


EXPOSE 3000

# En runtime aplicamos migraciones y seed antes de arrancar
CMD ["sh", "-c", "pnpm db:deploy && pnpm seed && pnpm start"]
