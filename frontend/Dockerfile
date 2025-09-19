FROM node:18-alpine

WORKDIR /app

# Kopiuj package*.json i instaluj zależności
COPY package*.json ./
RUN npm ci

# Kopiuj kod frontendu
COPY src ./src
COPY public ./public
COPY tsconfig.json postcss.config.js tailwind.config.js ./

# Kopiuj katalog shared z root do /app/shared
COPY ../shared ./shared

EXPOSE 3000

CMD ["npm", "start"]
