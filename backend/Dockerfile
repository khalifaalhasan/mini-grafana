# ==========================================
# Stage 1: Build & Compile TypeScript Backend
# ==========================================
FROM oven/bun:alpine AS build
WORKDIR /app

# Copy dependency metadata & lockfile
COPY package.json bun.lock ./

# Install seluruh dependencies (termasuk devDependencies untuk build ts)
RUN bun install --frozen-lockfile

# Copy seluruh source code backend
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

# Copy artifact build utama dari stage build
COPY --from=build /app/dist ./dist

# ✅ KUNCI MUTLAK: Copy folder SQL migrasi Drizzle agar terbaca saat runtime!
COPY --from=build /app/drizzle ./drizzle

# ✅ KUNCI MUTLAK: Copy script/file migrasi TypeScript (jika lu jalankan via bun run src/lib/db/migrate.ts)
COPY --from=build /app/src/lib/db ./src/lib/db

# Expose port aplikasi NestJS
EXPOSE 3000

# Gunakan non-root user bawaan 'bun' untuk aspek keamanan
USER bun

# Eksekusi aplikasi di production
CMD ["bun", "dist/main.js"]