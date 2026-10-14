# Base Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Expose API port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
