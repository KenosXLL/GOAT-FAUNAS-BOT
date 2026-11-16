FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY src ./src
USER node
CMD ["node", "src/index.js"]
