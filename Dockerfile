# ==========================================
# Stage 1: Build & Compile NestJS Backend
# ==========================================
FROM oven/bun:alpine AS build
WORKDIR /app

# Copy dependency metadata & lockfile
COPY package.json bun.lock ./

# Install seluruh dependencies (termasuk devDependencies untuk build ts)
RUN bun install --frozen-lockfile

# Copy source code backend
COPY . .

# Compile TypeScript ke direktori /dist
RUN bun run build

# ==========================================
# Stage 2: Production Lightweight Image
# ==========================================
FROM oven/bun:alpine AS production
WORKDIR /app

# Konfigurasi environment default
ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency metadata & lockfile
COPY package.json bun.lock ./

# Install HANYA production dependencies (menghemat ukuran image)
RUN bun install --production --frozen-lockfile

# Copy artifact build dari stage pertama
COPY --from=build /app/dist ./dist

# Expose port aplikasi NestJS
EXPOSE 3000

# Gunakan non-root user bawaan 'bun' untuk aspek keamanan
USER bun

# Eksekusi aplikasi di production
CMD ["bun", "dist/main.js"]
