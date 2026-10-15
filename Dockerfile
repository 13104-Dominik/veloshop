# Etap 1: build frontendu
FROM node:22-alpine AS front
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Etap 2: backend + gotowy frontend (jedna usługa)
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=front /app/frontend/dist /app/frontend/dist
EXPOSE 3000
# init-db jest idempotentne (tworzy tabele/dane tylko gdy ich brak)
CMD ["sh", "-c", "node scripts/init-db.js && node src/server.js"]
