#!/usr/bin/env bash

set -e

if ! systemctl is-active --quiet docker; then
  sudo systemctl start docker;
fi;
docker compose -f docker-compose.test.yml down -v 
docker compose -f docker-compose.test.yml up -d --wait 
NODE_ENV=test pnpm --dir apps/backend migrate 
NODE_ENV=test pnpm --dir apps/backend test
