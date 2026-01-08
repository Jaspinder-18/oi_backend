FROM ghcr.io/puppeteer/puppeteer:latest

# Use root to install dependencies to avoid permission issues
USER root

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Change ownership to the pptruser so it can run the app
RUN chown -R pptruser:pptruser /usr/src/app

# Switch back to non-root user
USER pptruser

CMD ["npm", "start"]
