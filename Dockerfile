FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# Đúng với package.json của bạn: "start": "node src/server.js"
CMD ["npm", "run", "start"]