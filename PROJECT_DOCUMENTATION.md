# AAMigos Project Documentation

## Project Overview

AAMigos is a MERN stack smart device repair and pickup platform. It connects customers who need device repair support with pickup agents and service centers. The application supports doorstep pickup, request tracking, agent workflow management, service catalog management, and an AAMigos-focused AI chatbot.

The project is built as an existing full-stack application and has been repaired and extended without rebuilding the architecture or changing the finalized UI theme.

## Tech Stack

- Frontend: React, Vite, Zustand, React Router, Framer Motion, Tailwind CSS setup
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentication: Email/password with JWT
- Password hashing: bcrypt
- File uploads: Multer with Cloudinary storage
- AI chatbot: Groq API
- Validation and API safety: Backend route guards and role checks

## Application Roles

### Customer

Customers can:

- Register and log in using email/password.
- Complete onboarding with profile details, address, and profile photo.
- Create device repair pickup requests.
- Upload invoice PDFs.
- Select device category, company, and model.
- Track repair status.
- View all, pending, and active orders.
- Cancel pending orders.
- Select a repair package when an agent provides package options.
- Use the AAMigos chatbot for project-related help.

### Agent

Agents can:

- Register and log in using email/password.
- Complete onboarding with profile details, address, profile photo, PAN, and Aadhaar.
- View pending pickup requests.
- Approve and assign requests to themselves.
- View ongoing and assigned repair jobs.
- Advance request status through the repair workflow.
- Add repair package options.
- Approve free warranty service during the free service review stage.
- Use the AAMigos chatbot.

### Admin

Admins can:

- Log in using the seeded admin credentials.
- View platform overview stats.
- View registered agents and KYC completion status.
- View and add service centers.
- View catalog data.
- Add companies.
- Add device models.
- Manage the catalog data needed for customers to create repair requests.

Admin registration is not public. Admin access is seeded from server environment variables.

Current seeded admin:

```text
Email: jatsandeep275@gmail.com
Password: Admin@123
```

## Authentication Flow

The application uses JWT-based authentication.

- Customer login: `/api/auth/user/login`
- Customer register: `/api/auth/user/register`
- Agent login: `/api/auth/agent/login`
- Agent register: `/api/auth/agent/register`
- Admin login: `/api/auth/admin/login`

JWT tokens are stored in browser local storage along with the active role. Protected frontend routes redirect users based on their role.

Google authentication is not used. The project currently supports only email/password authentication.

## Backend Architecture

The backend is located in `server/`.

Important folders:

- `server/app.js`: Express app setup, MongoDB connection, seed setup, route mounting
- `server/routes/`: API route definitions
- `server/controllers/`: Business logic for each module
- `server/models/`: Mongoose schemas
- `server/middlewares/`: JWT and role protection middleware
- `server/utils/`: Seed helpers for admin and catalog data

### Main Backend Modules

- Auth module
- Customer module
- Agent module
- Admin module
- Repair request module
- Setup/onboarding module
- Chatbot module
- Cloudinary upload configuration

## Frontend Architecture

The frontend is located in `client/`.

Important folders:

- `client/src/App.jsx`: Main route setup
- `client/src/components/`: Shared UI and auth components
- `client/src/components/dashboard/`: Dashboard shell, cards, badges, chatbot widget
- `client/src/pages/customer/`: Customer screens
- `client/src/pages/agent/`: Agent screens
- `client/src/pages/admin/`: Admin dashboard screens
- `client/src/onboarding/`: Customer and agent onboarding flow
- `client/src/services/api.js`: API helper methods
- `client/src/store/`: Zustand auth and onboarding state
- `client/src/utils/`: Shared order status helpers

The existing dark/orange AAMigos UI theme is preserved.

## Database Collections

The application uses MongoDB with Mongoose models.

Important collections:

- `users`
- `agents`
- `admins`
- `requests`
- `devices`
- `devicecategories`
- `companies`
- `devicemodels`
- `servicecenters`
- `transactions`
- `devicestatusupdates`

The transaction and device status update models are currently kept for future payment/status-history integration.

## Repair Request Workflow

Main request status flow:

```text
Pending -> Approved -> PickedUp -> FreeApproval -> InRepair -> Delivering -> Paid -> Completed
```

Cancellation:

```text
Pending -> Cancelled
```

Important rules:

- Customers can cancel only pending requests.
- Agents can approve only pending requests.
- Only the assigned agent can update an assigned request.
- Status updates must follow the defined workflow.
- Customers can select only valid package options added by the assigned agent.

## File Uploads

The project currently uses Cloudinary for uploads.

Used for:

- Profile pictures during onboarding
- Invoice PDFs during repair request creation

Cloudinary is required unless upload handling is changed to local or another storage provider.

## Groq AI Chatbot

The chatbot is integrated through the backend so the Groq API key stays private.

Frontend:

- Dashboard chatbot widget
- Session-only conversation history
- Loading and error states
- UI consistent with current dashboard theme

Backend:

- Protected chatbot route
- Groq API request handling
- AAMigos-specific system prompt

The chatbot is intended to answer only AAMigos-related questions, including:

- Project overview
- Features
- Modules
- User workflows
- Use cases
- FAQs
- How application functionality works

For unrelated questions, it should politely respond that it only answers AAMigos project-related questions.

## Environment Variables

### Server

Create `server/.env` using `server/.env.example`.

Required:

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

Notes:

- `MONGO_URI` is required for MongoDB Atlas/local MongoDB.
- `JWT_SECRET` should be a long secure random string.
- Cloudinary keys are required for current upload functionality.
- `GROQ_API_KEY` is required for the chatbot.
- `GROQ_MODEL` can remain as the default unless a different Groq model is preferred.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` seed the first admin account.

### Client

Create `client/.env` only if the API URL needs to be overridden.

```env
VITE_API_URL=/api
```

## Setup and Run

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

## Completed Work

The following work has been completed:

- Existing frontend and backend analyzed.
- Email/password JWT authentication preserved.
- Google authentication ignored/removed from scope.
- MongoDB Atlas connection verified.
- Groq API key/model verified.
- Groq chatbot added.
- Admin role added.
- Admin dashboard added.
- Admin account seeded and verified.
- Default device categories seeded.
- Frontend build verified.
- Frontend lint verified.
- Backend syntax verified.
- Customer order creation made safer.
- Agent assignment workflow fixed.
- Request status transition validation added.
- Customer package selection validation added.
- Agent package input validation improved.
- Admin catalog/service center management added.
- Existing UI theme preserved.

## Remaining Work

These items are not blockers for the current functional project, but should be handled before a production launch:

- Add full automated test coverage for backend APIs.
- Add frontend component/integration tests.
- Add stronger form validation messages for admin catalog forms.
- Add edit/delete support for admin-managed companies, models, and service centers.
- Add pagination/search for admin lists when data grows.
- Add production CORS configuration for the deployed frontend domain.
- Add rate limiting for auth and chatbot endpoints.
- Add request logging and error monitoring.
- Add a production deployment guide.
- Confirm Cloudinary upload limits and folder organization for production.
- Add backup/restore process for MongoDB.

## Future Updates

Suggested future roadmap:

- Payment gateway integration.
- Transaction history UI.
- Payment status verification.
- Customer payment page.
- Invoice/payment receipts.
- Device status history timeline using the existing status update model.
- Admin dashboard charts and filters.
- Agent performance analytics.
- Customer notifications through email or SMS.
- Forgot password flow with SMTP/email.
- Role-based audit logs.
- Service center edit/delete workflows.
- More advanced chatbot knowledge grounded in live project data.
- Production-ready deployment on cloud hosting.

## Coming Soon

Payment and transaction-related models currently exist as future-ready groundwork. They should remain in the codebase for later payment integration.

Current payment-related functionality is not fully implemented as a real payment gateway. The status value `Paid` exists in the repair workflow, but actual payment processing is planned as a future update.

## Final Status

AAMigos is now functionally ready for local development and demo use with:

- Customer dashboard
- Agent dashboard
- Admin dashboard
- Repair request workflow
- Catalog/service center management
- Cloudinary uploads
- MongoDB Atlas connection
- Groq-powered AAMigos chatbot

Before production deployment, complete the remaining production hardening items listed above.
