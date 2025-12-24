# SSL Configuration for JobHigh on VPS

## Krok 1: Przygotowanie domeny

Przed rozpoczęciem upewnij się, że:
1. Masz domenę (np. `frat.com.pl` lub subdomenę `app.frat.com.pl`)
2. DNS domeny wskazuje na IP twojego VPS (`78.159.81.140`)

```bash
# Sprawdź czy domena wskazuje na serwer
nslookup frat.com.pl
```

---

## Krok 2: Zaktualizuj plik .env na VPS

Dodaj zmienną `DOMAIN_NAME` do pliku `.env`:

```bash
ssh <username>@78.159.81.140
cd jobHigh
nano .env
```

Dodaj na końcu pliku:
```
# SSL Configuration
DOMAIN_NAME=frat.com.pl
```

Zmień także:
```
REACT_APP_API_URL=https://frat.com.pl/api
```

---

## Krok 3: Wgraj nowe pliki konfiguracyjne

Na lokalnym komputerze zrób commit zmian:
```bash
git add .
git commit -m "Add SSL configuration"
git push
```

Na serwerze pobierz zmiany:
```bash
cd jobHigh
git pull
```

---

## Krok 4: Stwórz katalogi dla certyfikatów

```bash
sudo mkdir -p /var/www/certbot
sudo mkdir -p /etc/letsencrypt
```

---

## Krok 5: Najpierw uruchom bez SSL (do walidacji certyfikatu)

Tymczasowo użyj konfiguracji HTTP do walidacji Let's Encrypt:

```bash
# Zatrzymaj wszystko
sudo docker compose -f docker-compose.ssl.yml down

# Uruchom z tymczasową konfiguracją
sudo docker compose -f docker-compose.ssl.yml up -d
```

---

## Krok 6: Wygeneruj certyfikat SSL z Let's Encrypt

```bash
# Zainstaluj certbot (jeśli nie jest zainstalowany)
sudo apt update
sudo apt install certbot -y

# Zatrzymaj nginx tymczasowo
sudo docker compose -f docker-compose.ssl.yml stop frontend

# LUB jeśli masz też subdomenę www:
sudo certbot certonly --standalone -d frat.com.pl -d www.frat.com.pl --email servicefrat@gmail.com --agree-tos --no-eff-email
```

Certyfikaty będą w:
- `/etc/letsencrypt/live/twoja-domena.pl/fullchain.pem`
- `/etc/letsencrypt/live/twoja-domena.pl/privkey.pem`

---

## Krok 7: Uruchom z pełnym SSL

```bash
# Przebuduj frontend z nową konfiguracją nginx
sudo docker compose -f docker-compose.ssl.yml build --no-cache frontend

# Uruchom wszystko
sudo docker compose -f docker-compose.ssl.yml up -d
```

---

## Krok 8: Sprawdź czy działa

```bash
# Sprawdź kontenery
sudo docker ps

# Sprawdź logi nginx
sudo docker logs jobhigh_frontend

# Test HTTPS
curl -I https://frat.com.pl

# Test API
curl https://frat.com.pl/api/test
```

Z przeglądarki wejdź na: `https://frat.com.pl`

---
<!-- TODO!! -->
## Krok 9: Automatyczne odnowienie certyfikatu

Certyfikaty Let's Encrypt są ważne 90 dni. Dodaj cron job do automatycznego odnowienia:

```bash
sudo crontab -e
```

Dodaj linię:
```
0 0 1 * * certbot renew --pre-hook "docker-compose -f /home/pawelek/jobHigh/docker-compose.ssl.yml stop frontend" --post-hook "docker-compose -f /home/pawelek/jobHigh/docker-compose.ssl.yml start frontend"
```

---

## Troubleshooting

### Problem: Certbot nie może zwalidować domeny
```bash
# Upewnij się, że port 80 jest otwarty
sudo ufw allow 80
sudo ufw allow 443

# Sprawdź czy DNS się propagował
dig twoja-domena.pl
```

### Problem: Nginx nie startuje
```bash
# Sprawdź logi
sudo docker logs jobhigh_frontend

# Sprawdź konfigurację nginx
sudo docker exec jobhigh_frontend nginx -t
```

### Problem: Mixed content (HTTP na HTTPS)
Upewnij się, że `REACT_APP_API_URL` w `.env` używa `https://`

---

## Alternatywa: Użycie Cloudflare (prostsze)

Jeśli nie chcesz zarządzać certyfikatami ręcznie:

1. Dodaj domenę do Cloudflare (darmowe konto)
2. Zmień nameservery domeny na Cloudflare
3. W Cloudflare włącz "Full (strict)" SSL
4. Cloudflare automatycznie zapewni SSL między użytkownikiem a Cloudflare
5. Możesz użyć origin certificate od Cloudflare dla połączenia Cloudflare → VPS

---

## Pliki związane z SSL

- `frontend/nginx.conf` - konfiguracja nginx bez SSL (development)
- `frontend/nginx.ssl.conf` - konfiguracja nginx z SSL (produkcja)
- `frontend/Dockerfile` - Dockerfile bez SSL
- `frontend/Dockerfile.ssl` - Dockerfile używający konfiguracji SSL
- `docker-compose.yml` - docker-compose dla development
- `docker-compose.ssl.yml` - docker-compose dla produkcji z SSL
