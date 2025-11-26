# Recursive To-Do List WebApp

A modern, recursive To-Do list application built with React Router v7 (Remix), Appwrite, and Docker.

## Features

- **Recursive Tasks**: Create tasks with infinite levels of subtasks.
- **Authentication**: Secure Signup/Login with Appwrite and HTTP-only cookies.
- **Search & Filter**: Real-time search across all nested tasks and "Hide Completed" toggle.
- **Dark Mode**: Toggle between Day and Night themes.
- **Docker Deployment**: Production-ready setup with Nginx Proxy and automatic SSL (Let's Encrypt).

## Tech Stack

- **Frontend**: React Router v7, TypeScript, SCSS.
- **Backend**: Appwrite Cloud (Database, Auth).
- **Deployment**: Docker Compose, Nginx Proxy.

## Local Development

### 1. Prerequisites

- Node.js (v20+)
- Appwrite Cloud Account

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Environment Setup

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Fill in your Appwrite credentials in `.env`:
    *   `VITE_APPWRITE_ENDPOINT`: Your Appwrite Endpoint (e.g., `https://cloud.appwrite.io/v1`)
    *   `VITE_APPWRITE_PROJECT_ID`: Your Project ID
    *   `ADMIN_KEY`: An API Key from Appwrite Console with scopes: `users.read`, `users.write`, `databases.read`, `databases.write`.
    *   `SESSION_SECRET`: A random string for cookie encryption.

### 4. Run Locally

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

## Production Deployment (Docker)

This project uses `nginx-proxy` and `acme-companion` for automatic SSL certificates.

### 1. Build Image (Locally)

Since environment variables need to be baked into the frontend build, build the image locally:

```bash
# Replace values with your actual credentials
docker build --platform linux/amd64 \
  --build-arg VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
  --build-arg VITE_APPWRITE_PROJECT_ID=your_project_id \
  -t your-dockerhub-user/recursive-todo:latest .

docker push your-dockerhub-user/recursive-todo:latest
```

### 2. Deploy (On Server)

1.  Copy `docker-compose.prod.yml` to your server.
2.  Create a `.env` file on the server with `DOMAIN` and `EMAIL_ADMIN`.
3.  Run:

```bash
docker compose -f docker-compose.prod.yml up -d
```
