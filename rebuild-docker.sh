#!/bin/bash

echo "🐳 Rebuilding Docker images with PATH fix..."
echo ""

# Stop any running containers
echo "Stopping containers..."
docker-compose down 2>/dev/null || true

# Remove old images
echo "Removing old images..."
docker rmi mentalbiriyani:dev 2>/dev/null || true
docker rmi mentalbiriyani:prod 2>/dev/null || true

# Rebuild development image
echo ""
echo "📦 Building development image..."
docker build -t mentalbiriyani:dev .

# Rebuild production image
echo ""
echo "📦 Building production image..."
docker build -f Dockerfile.production -t mentalbiriyani:prod .

echo ""
echo "✅ Docker images rebuilt successfully!"
echo ""
echo "To run:"
echo "  Development: docker run -p 5000:5000 mentalbiriyani:dev"
echo "  Production:  docker run -p 5000:5000 mentalbiriyani:prod"
echo ""
