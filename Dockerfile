# syntax=docker/dockerfile:1

# ---- build: Node 24 LTS, same version as .nvmrc / CI ----
FROM node:24-alpine AS build
WORKDIR /app
# Husky hooks are a dev-machine concern; skip them inside the image.
ENV HUSKY=0 CI=true
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- runtime: static files on nginx, no Node at runtime ----
FROM nginx:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/angular-evolution-lab/browser /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
