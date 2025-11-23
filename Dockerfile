# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
ENV NODE_ENV=development
COPY package.json ./
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p data public && \
    if [ ! -f data/state.json ]; then \
    if [ -f data/state.example.json ]; then \
    cp data/state.example.json data/state.json; \
    else \
    echo '{"word":"","options":""}' > data/state.json; \
    fi; \
    fi
RUN npm run build

FROM base AS runner
WORKDIR /app
RUN mkdir -p /app/data
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["npm", "run", "start"]


