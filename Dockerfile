FROM node:18-alpine

WORKDIR /app

# Use clean npm cache for faster installs
RUN npm cache clean --force

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies with production-only flags first
RUN npm install --only=production --no-audit --no-fund

# Then install dev dependencies
RUN npm install

# Install server dependencies
RUN cd server && npm ci

# Copy application code
COPY . .

# Set NODE_ENV explicitly for better performance
ENV NODE_ENV=development

# Optimize Node.js performance
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose port
EXPOSE 5173

# Use the optimized development command
CMD ["npm", "run", "dev"]
