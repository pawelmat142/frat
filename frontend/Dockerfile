FROM node:18-alpine AS builder

WORKDIR /app

# Argumenty build-time (zmienne środowiskowe)
ARG REACT_APP_API_URL
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_APP_ID

# Eksportuj jako zmienne środowiskowe dla npm build
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY \
    REACT_APP_FIREBASE_AUTH_DOMAIN=$REACT_APP_FIREBASE_AUTH_DOMAIN \
    REACT_APP_FIREBASE_PROJECT_ID=$REACT_APP_FIREBASE_PROJECT_ID \
    REACT_APP_FIREBASE_APP_ID=$REACT_APP_FIREBASE_APP_ID

# Kopiuj frontend i shared
COPY frontend/package*.json ./frontend/
COPY shared ./shared

# Instaluj zależności
WORKDIR /app/frontend
RUN npm install

# Kopiuj kod frontendu
COPY frontend ./

# Zbuduj frontend
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

# Kopiuj skompilowany frontend z buildera
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Kopiuj konfigurację nginx
COPY frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
