set -e
if ! systemctl is-active --quiet docker; then
  sudo systemctl start docker
fi

docker compose down
docker compose -f docker-compose.yml up --wait
pnpm --dir apps/backend migrate
