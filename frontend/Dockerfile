# Stage 1: Build React/Vite application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_BASE_URL is baked into the build at build time, not read at runtime.
# Pass it via `docker build --build-arg VITE_API_BASE_URL=https://...`.
# Falls back to whatever is in .env.production if no build-arg is supplied.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve static files via production Nginx
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx official image auto-runs envsubst on /etc/nginx/templates/*.template
# at container startup, writing the resolved file to /etc/nginx/conf.d/.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
