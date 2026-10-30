FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./

FROM deps AS build
RUN npm ci
COPY . .
RUN npm run build

FROM deps AS prod-deps
RUN npm ci --omit=dev

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/data/portfolio.sqlite
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./
COPY scripts/db-import.mjs ./scripts/db-import.mjs
COPY app/db/schema.sql ./app/db/schema.sql
RUN mkdir -p /data && chown node:node /data
VOLUME /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --start-period=15s CMD node -e 'fetch("http://127.0.0.1:3000/admin/login").then(res => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))'
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]
