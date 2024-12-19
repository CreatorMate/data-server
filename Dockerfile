FROM node:20-bullseye-slim AS base

# Install OpenSSL 1.1
RUN apt-get update && apt-get install -y openssl=1.1.1* && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY package-lock.json ./
COPY src ./
COPY prisma ./
COPY modules ./

COPY . .

RUN npm ci && \
    npm run build && \
    npm prune --production

ENV PORT 3000
EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["start"]