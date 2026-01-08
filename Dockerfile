FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Set a custom cache directory inside the app folder
ENV PUPPETEER_CACHE_DIR=/usr/src/app/.cache/puppeteer

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

# EXPLICITLY install the Chrome browser in our custom cache folder
RUN npx puppeteer browsers install chrome

COPY . .

# Ensure the pptruser owns everything, including the browser cache
RUN chown -R pptruser:pptruser /usr/src/app

USER pptruser

# Expose port (Render uses 10000 usually, but your code handles process.env.PORT)
EXPOSE 5000

CMD ["node", "server.js"]
