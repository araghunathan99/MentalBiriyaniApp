# Docker Setup for MentalBiriyani

This guide explains how to build and run MentalBiriyani using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (optional, but recommended)

## Quick Start

### Option 1: Using Docker (Simple)

1. **Build the Docker image:**
   ```bash
   docker build -t mentalbiriyani .
   ```

2. **Run the development server:**
   ```bash
   docker run -p 5000:5000 -v $(pwd):/app mentalbiriyani
   ```

3. **Access the app:**
   Open your browser to `http://localhost:5000`

### Option 2: Using Docker Compose (Recommended)

1. **Start the app:**
   ```bash
   docker-compose up
   ```

2. **Access the app:**
   Open your browser to `http://localhost:5000`

3. **Stop the app:**
   ```bash
   docker-compose down
   ```

## Detailed Commands

### Development Workflow

**Run development server with live reload:**
```bash
docker run -p 5000:5000 -v $(pwd):/app -v /app/node_modules mentalbiriyani npm run dev
```

**Build for production:**
```bash
docker run -v $(pwd):/app mentalbiriyani npm run build
```

**Run build scripts:**
```bash
# Generate content lists
docker run -v $(pwd):/app mentalbiriyani python3 scripts/generate-media-lists.py

# Convert videos
docker run -v $(pwd):/app mentalbiriyani bash scripts/convert-videos.sh

# Parse chat conversations
docker run -v $(pwd):/app mentalbiriyani python3 scripts/parse-chat-conversations.py
```

**Build for GitHub Pages:**
```bash
docker run -v $(pwd):/app mentalbiriyani bash build-github-pages.sh
```

### Git LFS Setup in Docker

**Initialize Git LFS:**
```bash
docker run -v $(pwd):/app mentalbiriyani git lfs install
```

**Pull LFS files:**
```bash
docker run -v $(pwd):/app mentalbiriyani git lfs pull
```

**Download LFS files using Python script:**
```bash
docker run -v $(pwd):/app mentalbiriyani python3 download-lfs-files.py
```

## Volume Mounts Explained

- `-v $(pwd):/app` - Mounts current directory to /app in container (for live code changes)
- `-v /app/node_modules` - Prevents overwriting node_modules with host's (optional)
- `-p 5000:5000` - Maps port 5000 from container to host

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, map to a different port:
```bash
docker run -p 3000:5000 -v $(pwd):/app mentalbiriyani
```
Then access at `http://localhost:3000`

### Permission Issues
If you encounter permission issues with files created by Docker:
```bash
# Run with current user ID
docker run --user $(id -u):$(id -g) -p 5000:5000 -v $(pwd):/app mentalbiriyani
```

### Node Modules Issues
If dependencies aren't installing correctly:
```bash
# Rebuild the image without cache
docker build --no-cache -t mentalbiriyani .
```

### Git LFS Files Not Downloading
Make sure Git LFS is installed and initialized:
```bash
docker run -v $(pwd):/app mentalbiriyani bash -c "git lfs install && git lfs pull"
```

## Interactive Shell Access

To access a shell inside the container for debugging:
```bash
docker run -it -v $(pwd):/app mentalbiriyani bash
```

Once inside, you can run any commands:
```bash
npm run dev
npm run build
python3 scripts/generate-media-lists.py
```

## Production Deployment

For production deployment, build the optimized bundle:

```bash
# Build the app
docker run -v $(pwd):/app mentalbiriyani npm run build

# The built files will be in dist/public/
```

Then serve the `dist/public` directory with any static file server or deploy to GitHub Pages.

## Environment Variables

Create a `.env` file in the project root for environment-specific settings:

```env
NODE_ENV=development
PORT=5000
```

Then run with env file:
```bash
docker run --env-file .env -p 5000:5000 -v $(pwd):/app mentalbiriyani
```

## Clean Up

**Remove stopped containers:**
```bash
docker container prune
```

**Remove the image:**
```bash
docker rmi mentalbiriyani
```

**Remove everything (containers, images, volumes):**
```bash
docker system prune -a
```
