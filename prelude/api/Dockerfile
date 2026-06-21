# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json nest-cli.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build && npm prune --production

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
