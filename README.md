# Recursive To-Do List WebApp

A modern, recursive To-Do list application built with Remix (React Router v7), Appwrite, and Docker.

## Features

- **Recursive Tasks**: Create tasks with up to 10 levels of subtasks.
- **Authentication**: Secure Signup/Login with Appwrite and HTTP-only cookies.
- **Search & Filter**: Real-time search across all nested tasks and "Hide Completed" toggle.
- **Dark Mode**: Toggle between Day and Night themes.
- **Welcome Email**: Automated welcome email upon registration (via Appwrite Functions).
- **Docker Deployment**: Production-ready setup with Traefik Reverse Proxy and SSL.

## Tech Stack

- **Frontend**: Remix (React Router v7), TypeScript, SCSS.
- **Backend**: Appwrite Cloud (Database, Auth, Functions).
- **Deployment**: Docker Compose, Traefik.

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Appwrite Cloud Account

### 2. Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Install Appwrite CLI:
    ```bash
    npm install -g appwrite-cli
    ```

### 3. Appwrite Setup

1.  Login to Appwrite CLI:
    ```bash
    appwrite login
    ```
2.  Initialize the project (if not already linked):
    ```bash
    appwrite init project
    ```
3.  Run the setup script to create Database and Collections:
    ```bash
    node scripts/setup-appwrite.js
    ```
    *Note: Ensure `.env` contains your `DEV_KEY` (API Key).*

4.  Deploy the Welcome Email Function:
    ```bash
    appwrite push functions
    ```

### 4. Environment Variables

Create a `.env` file based on `.env.example`:

```dotenv
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
DEV_KEY=your_api_key_with_admin_access
SESSION_SECRET=super-secret-key
```

### 5. Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

### 6. Production Deployment (Docker)

1.  Ensure `acme.json` exists and has correct permissions (chmod 600 on Linux/Mac).
2.  Update `traefik.yml` with your email for Let's Encrypt.
3.  Update `docker-compose.yml` with your domain name in Traefik labels.
4.  Run:
    ```bash
    docker-compose up -d --build
    ```

## Project Structure

- `app/routes`: Application routes (signup, login, dashboard).
- `app/components`: UI Components (TodoCard, SearchBar, etc.).
- `app/services`: Backend services (Appwrite, Session, Cards).
- `app/utils`: Helper functions (Recursive logic, Validation).
- `appwrite/functions`: Appwrite Cloud Functions.
- `scripts`: Setup scripts.

## License

MIT
