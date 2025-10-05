#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="redis"
REDIS_PORT="6379"

# Kill old container if exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Removing existing Redis container..."
  docker rm -f $CONTAINER_NAME
fi

# Start Redis container
echo "Starting Redis..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $REDIS_PORT:6379 \
  redis:7-alpine

# Wait until Redis is ready
echo -n "Waiting for Redis to be ready"
until docker exec $CONTAINER_NAME redis-cli ping > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo " ready!"

echo "Redis is ready at localhost:$REDIS_PORT"
