FROM ghcr.io/puppeteer/puppeteer:latest

# Use root to setup
USER root
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (this will now download the correct Chromium)
RUN npm install

# Copy source code
COPY . .

# Set permissions
RUN chown -R pptruser:pptruser /usr/src/app

# Switch to non-root user
USER pptruser

# Render uses the PORT environment variable
EXPOSE 5000

CMD ["node", "server.js"]
