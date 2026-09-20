set -e
if ! systemctl is-active --quiet docker; then
  sudo systemctl start docker;
fi;
docker compose down
pnpm dev-script

