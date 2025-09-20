FROM node:18-alpine

WORKDIR /app

# Kopiuj package*.json i instaluj zależności
COPY frontend/package*.json ./
RUN npm ci

# Kopiuj kod frontendu
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tsconfig.json frontend/postcss.config.js frontend/tailwind.config.js ./

# Kopiuj katalog shared z root do /app/shared
COPY shared ./shared

EXPOSE 3000

CMD ["npm", "start"]
