# chmod +x install.sh
# ./install.sh

sudo docker compose down frontend
# 2. Pobierz najnowszą wersję kodu z repozytorium
git pull

sudo docker compose build --no-cache frontend

# 5. Uruchom aplikację ponownie w tle
sudo docker compose up -d frontend