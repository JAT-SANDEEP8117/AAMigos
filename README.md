# AAMigos

AAMigos is a MERN stack smart device repair and pickup platform. It connects customers, pickup agents, service centers, and admins in one workflow for device repair requests, pickup tracking, catalog management, and project support through an AI chatbot.

## Features

- Customer, agent, and admin role-based dashboards
- Email/password authentication with JWT
- Customer onboarding with profile, address, and profile photo
- Agent onboarding with profile, address, PAN, and Aadhaar details
- Repair request creation with invoice PDF upload
- Device category, company, model, and service center catalog flow
- Agent request approval and repair status updates
- Repair package selection workflow
- Admin dashboard for stats, agents, service centers, companies, and device models
- Groq-powered AAMigos chatbot for project-related help
- MongoDB seed setup for default categories and the first admin account
- Cloudinary-backed profile picture and invoice uploads

## Tech Stack

- Frontend: React, Vite, React Router, Zustand, Framer Motion
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT and bcrypt
- Uploads: Multer with Cloudinary storage
- AI: Groq API

## Project Structure

```text
AAmigos/
  client/   React frontend
  server/   Express/MongoDB backend
  PROJECT_DOCUMENTATION.md
  README.md
```

## Environment Setup

Create `server/.env` from `server/.env.example`.

Required server keys:

```env
MONGO_URI=
JWT_SECRET=
PORT=5000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=Admin
```

Create `client/.env` only if you need to override the API URL:

```env
VITE_API_URL=/api
```

## Admin Login

The first admin account is seeded from `server/.env` when the backend starts.

Current configured admin:

```text
Email: jatsandeep275@gmail.com
Password: Admin@123
```

## Run Locally

Install dependencies:

```bash
npm run install:all
```

Run backend:

```bash
npm run dev:server
```

Run frontend:

```bash
npm run dev:client
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## Verification

Useful checks:

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
node --check app.js
```

## Documentation

See `PROJECT_DOCUMENTATION.md` for detailed project documentation, module explanations, current status, remaining work, and future updates.

## Coming Soon

Payment and transaction models are intentionally kept for future payment integration. Current payment gateway processing is not fully implemented yet.
