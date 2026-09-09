set -e

docker compose down
sudo systemctl start docker 
pnpm dev-script

