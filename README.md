# AAMigos

AAMigos is a full-stack device-repair pickup platform for Smartphones, Laptops, and Tablets. Customers submit a repair request, pickup agents manage the repair lifecycle, and administrators maintain the supported catalog and service-center directory.

## What it includes

- JWT email/password authentication for customer, agent, and admin roles
- Profile onboarding, address collection, agent PAN/Aadhaar validation, and Cloudinary profile-photo uploads
- Repair request creation with a PDF invoice, predefined category-specific brands, a manual **Other** brand, and a manual model fallback
- Customer order tracking, pending-order cancellation, and repair-package selection
- Agent approval, assignment, package configuration, free-service approval, and controlled status progression
- Admin statistics, agent visibility, companies/models, and service-center management
- Protected Groq-backed AAMigos help chatbot

## Run locally

1. Create `server/.env` from `server/.env.example` and provide the required MongoDB, JWT, Cloudinary, Groq, and admin values. Do not commit that file.
2. Install the existing workspace dependencies with `npm run install:all`.
3. Run the backend with `npm run dev:server` and the frontend with `npm run dev:client` (or use the root `npm run dev` script if its already-declared tooling is installed).
4. Open `http://localhost:5173`; the health endpoint is `http://localhost:5000/api/health`.

The backend seeds the three supported categories and their predefined brand choices when it connects. Administrators add catalog models and service centers as needed. See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for the implemented architecture, routes, validation rules, workflows, and limitations.
