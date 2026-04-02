# Stage 1: Build dependencies
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies if needed, but not here)
RUN npm install

# Stage 2: Production image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy only node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy app source code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
