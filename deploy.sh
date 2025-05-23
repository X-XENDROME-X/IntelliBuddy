#!/bin/bash

# Set COMPOSE_BAKE environment variable to true
export COMPOSE_BAKE=true

# Build the Docker images
echo "Building Docker images..."
docker-compose build

# Start the containers
echo "Starting the containers..."

docker-compose up

echo "Application is now running at http://localhost"
