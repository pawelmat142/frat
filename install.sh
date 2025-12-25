# chmod +x install.sh
# ./install.sh

sudo docker compose down
# 2. Pobierz najnowszą wersję kodu z repozytorium
git pull

# 4. Zbuduj na nowo obrazy (wymuś przebudowanie backendu)
sudo docker compose build --no-cache backend
sudo docker compose build --no-cache frontend

# 5. Uruchom aplikację ponownie w tle
sudo docker compose up -d