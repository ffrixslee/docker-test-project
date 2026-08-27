# Docker Test Project

The goal of this project is to dockerize a simple Node.js service and deploy it to a remote server using GitHub Actions. You will also practice secrets management.

## Project Overview

This repository demonstrates:
1. Building a Node.js REST API with HTTP Basic Authentication.
2. Containerizing the service using Docker while ensuring sensitive files (`.env`) are excluded.
3. Setting up a remote Linux EC2 server with Docker.
4. Implementing automated CI/CD using GitHub Actions and GitHub Container Registry (`ghcr.io`).

---

## Requirements & Implementation Steps

### Step 1 — Creating a Node.js Service
- Implemented an Express server in `index.js` listening on port `3000`.
- **Public Route (`GET /`)**: Returns `Hello, world!`.
- **Protected Route (`GET /secret`)**: Requires HTTP Basic Auth credentials (`USERNAME` and `PASSWORD`). Returns `SECRET_MESSAGE` when authorized.
- Environment variable configuration managed via `.env` (excluded from version control).

### Step 2 — Dockerizing the Node.js Service
- Created `Dockerfile` based on `node:20-alpine`.
- Created `.dockerignore` to ensure `.env`, `node_modules`, and local build artifacts are **never** included in the Docker image build context.
- **Local Commands**:
  ```bash
  # Build Docker image
  docker build -t node-test-service .

  # Run container locally with environment file
  docker run -d -p 3000:3000 --env-file .env --name node-test node-test-service
  ```

### Step 3 — Setup Remote Linux Server
- Installed Docker on Amazon Linux 2023 EC2 instance:
  ```bash
  sudo dnf update -y
  sudo dnf install -y docker
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ec2-user
  ```
- Allowed inbound TCP traffic on port `3000` via AWS Security Group rules.

### Step 4 — Deployment with GitHub Actions
- Configured `.github/workflows/deploy.yml` triggered on push to `main`.
- Automatically builds the image and pushes to **GitHub Container Registry (`ghcr.io`)**.
- Connects to EC2 over SSH, pulls the latest container image, and restarts the container service with injected GitHub Secrets.

---

## Environment Variables & Secrets

### Local `.env` Template (`.env.example`)
```env
PORT=3000
SECRET_MESSAGE=your_secret_message_here
USERNAME=your_username
PASSWORD=your_password
```

### Required GitHub Repository Secrets
To run the automated deployment pipeline, configure the following secrets in **Settings > Secrets and variables > Actions**:

| Secret Name | Description |
| :--- | :--- |
| `EC2_HOST` | Remote EC2 hostname or IP address |
| `EC2_USERNAME` | SSH login username (e.g. `ec2-user`) |
| `EC2_SSH_KEY` | Private SSH Key for EC2 authentication |
| `SECRET_MESSAGE` | Content returned by `/secret` endpoint |
| `USERNAME` | Basic Auth username |
| `PASSWORD` | Basic Auth password |

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Start server locally
npm start

# Test public endpoint
curl http://localhost:3000/

# Test secret endpoint with auth
curl -u <USERNAME>:<PASSWORD> http://localhost:3000/secret
```
