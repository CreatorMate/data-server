FROM node:20-alpine AS base

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