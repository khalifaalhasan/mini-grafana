# ==========================================
# Stage 1: Build React / Vite Frontend
# ==========================================
FROM oven/bun:alpine AS build
WORKDIR /app

# Copy lockfile & package.json
COPY package.json bun.lock* ./

# Install dependencies (jika package.json sudah tersedia)
RUN if [ -f package.json ]; then bun install --frozen-lockfile; fi

# Copy source code frontend
COPY . .

# Build Vite / React (menghasilkan folder /dist)
RUN if [ -f package.json ]; then bun run build; else mkdir -p dist && echo "<h1>Mini-Grafana Frontend (Deferred)</h1>" > dist/index.html; fi

# ==========================================
# Stage 2: Production Lightweight Nginx Image
# ==========================================
FROM nginx:alpine AS production

# Copy hasil build ke direktori HTML Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port HTTP standar Nginx
EXPOSE 80

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
