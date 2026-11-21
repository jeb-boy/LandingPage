# Backend production image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Application source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

# Healthcheck hits the live health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/v1/health || exit 1

CMD ["sh", "-c", "npm run migrate && npm start"]
