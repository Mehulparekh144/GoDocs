#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="postgres"
DB_PASS="postgres"
DB_NAME="db"

# Kill old container if exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Removing existing container..."
  docker rm -f $CONTAINER_NAME
fi

# Start Postgres container
echo "Starting Postgres..."
docker run -d \
  --name $CONTAINER_NAME \
  -e POSTGRES_PASSWORD=$DB_PASS \
  -p 5432:5432 \
  postgres:16-alpine

# Wait until Postgres is ready
echo -n "Waiting for Postgres to be ready"
until docker exec $CONTAINER_NAME pg_isready -U postgres > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo " ready!"

# Create database (owned by default 'postgres' superuser)
echo "Creating database '$DB_NAME'..."
docker exec -u postgres $CONTAINER_NAME psql -c "CREATE DATABASE $DB_NAME;" || true

#Install uuid extension in target database
echo "Installing uuid extension in '$DB_NAME'..."
docker exec -u postgres $CONTAINER_NAME psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo "Database '$DB_NAME' is ready at localhost:5432 (user=postgres, password=$DB_PASS)"