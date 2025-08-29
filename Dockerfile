# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl netcat-openbsd

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies as root
RUN npm install --omit=dev && npm cache clean --force

# Copy entrypoint script and make it executable
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy application code
COPY . .

# Create exports directory with proper permissions for nodeuser
RUN mkdir -p /app/exports && \
    chmod 755 /app/exports && \
    chown -R nodeuser:nodejs /app/exports && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default command
CMD ["npm", "start"] 