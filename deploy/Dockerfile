FROM node:20-alpine AS build
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json shared/
COPY web/package.json web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY shared/ shared/
COPY web/ web/
COPY tsconfig.base.json ./

# Build shared first, then web
RUN pnpm --filter shared build 2>/dev/null; pnpm --filter web build

# Production image
FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
