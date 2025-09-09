# AI Learning Mini MVP

A Node.js (TypeScript) server with Express, PostgreSQL (Docker), and Prisma.  
Includes initial API endpoints for categories and lessons, database migrations, and seed data.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Environment Variables](#environment-variables)
- [Docker: Local PostgreSQL](#docker-local-postgresql)
- [Prisma: Schema, Migrations, and Seed](#prisma-schema-migrations-and-seed)
- [Project Structure](#project-structure)
- [NPM Scripts](#npm-scripts)
- [API Endpoints](#api-endpoints)
- [Testing with Postman / Thunder Client](#testing-with-postman--thunder-client)
- [Common Issues](#common-issues)
- [License](#license)

---

## Prerequisites
- **Node.js** v18+ and npm
- **Docker Desktop** with WSL2 enabled (Windows)
- Optional: Postman Desktop or Thunder Client (VS Code extension) for API testing

---

## Quick Setup

```bash
# 1) Install dependencies (inside the server folder)
cd server
npm install

# 2) Run PostgreSQL with Docker
docker compose up -d

# 3) Create environment file (.env) and configure DATABASE_URL

# 4) Run Prisma migrations and generate client
npx prisma migrate dev --name init
npx prisma generate

# 5) (Optional) Seed initial data
npx prisma db seed

# 6) Start the development server
npm run dev
# Server runs on: http://localhost:4000

