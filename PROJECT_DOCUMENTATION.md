# AAMigos — Project Documentation

## 1. Purpose

AAMigos addresses a common repair-service problem: customers need a simple way to request a device pickup and understand repair progress, while pickup agents and service operators need a controlled workflow rather than disconnected calls and spreadsheets. The application provides one role-based system for submitting, assigning, tracking, and administering repair work.

The implemented scope is repair pickup management for exactly three device categories: **Smartphones**, **Laptops**, and **Tablets**. It is designed for local development and demonstrations, not as a payment-processing or production operations system.

## 2. Roles and capabilities

### Customer

- Register or log in using email and password.
- Complete a profile with name, phone, address, and profile photo.
- Select a supported device category and a predefined brand, or select **Other** and enter a brand manually.
- Select an administrator-maintained device model, or enter a model manually when it is not listed.
- Upload a purchase invoice PDF and submit a unique IMEI/serial-number repair request.
- View all, pending, and active requests; cancel only pending requests.
- Track the assigned agent and workflow status.
- Select exactly one repair package during the free-service-review stage, unless an agent approves free service.

### Pickup agent

- Register or log in, then complete profile, address, profile-photo, PAN, and Aadhaar onboarding.
- Review all pending requests and approve one to assign it to themselves.
- View ongoing and historical assigned jobs, including customer contact and pickup address.
- Advance only their own requests through the defined lifecycle.
- Set repair package options after pickup, approve free service during review, and begin repair only after a free-service approval or a customer package decision.

### Administrator

- Log in using the account seeded from server configuration. Public admin registration is intentionally unavailable.
- View counts for customers, agents, requests, service centers, companies, models, and status totals.
- View agents and KYC completion.
- Add companies, device models, and service centers. Models must belong to a company that supports the selected category; service centers must reference existing companies.

## 3. Repair workflow

```text
Pending → Approved → PickedUp → FreeApproval → InRepair → Delivering → Paid → Completed
```

Customers can move a request only from `Pending` to `Cancelled`. An agent can approve only `Pending` work, after which it is assigned to that agent. The API prevents an agent from advancing a request they do not own or skipping a state.

At `FreeApproval`, an agent either approves free service or provides package options. In the latter case, the customer must select one package before the agent can move the request to `InRepair`. Package values cannot be changed after that decision. `Paid` remains a workflow status only; no payment gateway, charge capture, or receipt flow is implemented.

## 4. Device catalog and manual entries

The backend seeds the supported categories and category-specific predefined brands on startup:

| Category | Seeded brands |
| --- | --- |
| Smartphones | Apple, Samsung, Google, OnePlus, Xiaomi, Oppo, Vivo, Realme, Motorola, Nothing |
| Laptops | Apple, Dell, HP, Lenovo, Asus, Acer, Microsoft, MSI |
| Tablets | Apple, Samsung, Lenovo, Xiaomi, Microsoft, Huawei |

Administrators maintain named catalog models. A customer can still submit a device whose brand is not in the list by choosing `Other`, entering the brand, and entering the model. They can also enter a model for a known brand when it is not in the catalog. These custom entries are retained on the device record; they do not silently alter the managed catalog. Catalog-backed requests retain the associated model reference and use a linked service center when one exists. A manual-other-brand request is accepted without inventing a service center assignment.

## 5. Architecture and project structure

```text
AAMigos/
├── client/                         React/Vite single-page application
│   └── src/
│       ├── components/              Authentication, route guards, dashboard components
│       ├── onboarding/              Customer/agent profile and KYC flow
│       ├── pages/customer/          Customer dashboard and order views
│       ├── pages/agent/             Agent dashboard and job views
│       ├── pages/admin/             Admin dashboard and catalog screens
│       ├── services/api.js          Authenticated API client
│       ├── store/                   Zustand authentication/onboarding state
│       └── utils/                   Status and device display helpers
├── server/
│   ├── controllers/                 API business rules
│   ├── middlewares/                 JWT and role checks
│   ├── models/                      Mongoose schemas
│   ├── routes/                      Express endpoint definitions
│   ├── utils/                       Catalog/admin/demo seed helpers
│   ├── cloudConfig.js               Cloudinary Multer storage configuration
│   └── app.js                       Application bootstrap and database connection
├── README.md
└── PROJECT_DOCUMENTATION.md
```

The frontend uses React 19, React Router, Zustand, Framer Motion, Vite, and the existing Tailwind integration. The backend uses Node.js, Express, Mongoose, bcrypt, JSON Web Tokens, Multer, Cloudinary storage, dotenv, and the Groq HTTP API. No new packages are required for the application features documented here.

## 6. Authentication and authorization

Customer and agent registration hash passwords with bcrypt and immediately return a seven-day JWT. Login verifies the hash and returns the same role-bound token. Email values are normalized by the login/admin seed paths where applicable; users should enter a valid email address and at least a six-character password.

The frontend stores the token and role in browser local storage, sends the token as `Authorization: Bearer <token>`, protects routes, verifies a stored session by fetching the relevant profile, and redirects incomplete customer/agent profiles to onboarding. The backend independently verifies JWT signatures and verifies that the corresponding user, agent, or admin exists before allowing role-restricted actions. Frontend checks are only navigation conveniences; backend authorization is authoritative.

## 7. Data model

- `User`: customer identity, password hash, profile picture, address, phone, and request references.
- `Agent`: agent identity, password hash, profile/KYC fields, address, and assigned request references.
- `Admin`: seeded administrator identity and password hash.
- `DeviceCategory`: one of Smartphones, Laptops, Tablets and related companies.
- `Company`: brand name with supported categories, models, and service centers.
- `DeviceModel`: administrator-managed model, optional image URL, company, and category.
- `Device`: serial/IMEI, uploaded invoice URL, optional catalog model, submitted brand/model names, category, warranty, issue, and owner.
- `Request`: customer/device references, assigned agent/service center, status, free-service flag, package maps, chosen package, amount placeholders, and creation date.
- `ServiceCenter`: name, companies, address, and optional contact number.
- `Transaction` and `DeviceStatus`: existing future-oriented schemas; no routes currently use them.

## 8. API reference

All routes are mounted below `/api`. Errors are JSON objects with a `message` field. All endpoints other than health and authentication require a valid Bearer token, and role restrictions are noted below.

### Public and authentication

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | Returns `{ status: "ok" }`. |
| POST | `/auth/user/register` | Register customer. |
| POST | `/auth/user/login` | Customer login. |
| POST | `/auth/agent/register` | Register agent. |
| POST | `/auth/agent/login` | Agent login. |
| POST | `/auth/admin/login` | Seeded-admin login. |

### Customer and onboarding

| Method | Route | Role | Description |
| --- | --- | --- | --- |
| POST | `/setup/user/setupProfile` | Customer | Multipart profile setup; `profilePic` plus profile/address fields. |
| POST | `/setup/agent/setupProfile` | Agent | Multipart profile/KYC setup. |
| GET | `/request/categories` | Customer | Supported categories only. |
| GET | `/request/companies/:category` | Customer | Predefined brands for category. |
| GET | `/request/models/:category/:company` | Customer | Catalog models for valid category/brand pairing. |
| POST | `/request/newOrder` | Customer | Multipart repair request and `invoice` PDF. |
| GET | `/customer/allOrders` | Customer | All own orders. |
| GET | `/customer/pendingOrders` | Customer | Own pending orders. |
| GET | `/customer/activeOrders` | Customer | Own active work. |
| GET | `/customer/trackOrder/:reqId` | Customer | Own detailed order. |
| POST | `/customer/cancelOrder/:reqId` | Customer | Cancel own pending order. |
| GET | `/customer/getPackages/:reqId` | Customer | Own package options. |
| POST | `/customer/updatePackage/:reqId/:name` | Customer | Select one valid package during review. |

The existing `GET /customer/latestUnpaidOrder`, `GET /customer/getDetails`, `PUT /customer/updateDetails`, and `GET /customer/request/:reqId` endpoints are also mounted for authenticated customers. The dashboard currently uses the routes listed above.

### Agent, admin, and chatbot

| Method | Route | Role | Description |
| --- | --- | --- | --- |
| GET | `/agent/pendingRequests` | Agent | Pending requests available for approval. |
| POST | `/agent/approveRequest/:reqId` | Agent | Atomically assigns a pending request. |
| GET | `/agent/onGoingRequests` | Agent | Own nonterminal assigned jobs. |
| GET | `/agent/allAssignedRequests` | Agent | Own assignment history. |
| GET | `/agent/trackOrder/:reqId` | Agent | Own detailed job; pending work can be previewed. |
| POST | `/agent/updateStatus/:reqId/update/:status` | Agent | Valid next-state transition only. |
| POST | `/agent/packages/:reqId` | Agent | Set repair package rows before a decision. |
| POST | `/agent/freeService/:reqId` | Agent | Approve free service during review. |
| GET | `/admin/stats`, `/admin/agents`, `/admin/service-centers`, `/admin/catalog` | Admin | Administrative reads. |
| POST | `/admin/service-centers`, `/admin/companies`, `/admin/models` | Admin | Administrative catalog writes. |
| POST | `/chatbot/message` | Any authenticated role | AAMigos-only Groq help response. |

## 9. Validation and uploads

- Device category is server-restricted to the three supported types.
- A catalog model submission is verified against the submitted model ID, model name, company, and category. This prevents same-name model ambiguity.
- Other-brand and manually named models preserve the entered device identity; known brands are checked against their category.
- IMEI/serial values are trimmed and unique across device records.
- An invoice is required and must report MIME type `application/pdf`.
- Profile photos are required for onboarding and must report an image MIME type.
- Customer/agent phone numbers and PIN codes are validated as 10 and 6 digits. Agent PAN and Aadhaar follow the UI/server formats.
- Package item labels are trimmed and nonnegative numeric prices are retained. Empty rows are ignored.

Cloudinary-backed Multer storage uploads profile photos and invoices to the `aamigos_dev` folder. Cloudinary credentials are required for those flows.

## 10. Environment configuration

Copy `server/.env.example` to `server/.env` and set values privately. Do not put credentials in documentation, source control, client environment files, screenshots, or issue trackers.

Required server configuration:

```env
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Optional values include `PORT` (defaults to 5000), `GROQ_MODEL`, `ADMIN_NAME`, and the existing optional demo customer/agent variables described in the environment example. Demo credentials are never documented as real values. The client uses the Vite `/api` proxy by default; the existing optional client demo variables only populate visible demo-login shortcuts when set.

## 11. Installation, running, and checks

From the repository root:

```bash
npm run install:all
npm run dev:server
npm run dev:client
```

The frontend runs at `http://localhost:5173` and proxies `/api` to the backend at port 5000. The root `npm run dev` convenience command starts both where its declared development tool is available.

Useful checks:

```bash
npm run lint --prefix client
npm run build --prefix client
node --check server/app.js
```

The project has no automated test suite configured. Manual verification should cover a new customer onboarding, a new agent onboarding, admin catalog/service-center creation, known-brand and Other-brand request submissions, agent approval, package decision/free service, status advancement, cancellation, route-role redirects, expired/invalid token handling, and chatbot error handling when a Groq key is unavailable.

## 12. Security and operational notes

- Passwords are bcrypt hashes; JWT signing relies on a strong private `JWT_SECRET`.
- Browser storage means users should log out on shared devices. A production deployment should prefer a reviewed session strategy appropriate to its threat model.
- Role checks and request ownership checks are enforced on the server.
- API keys remain server-side; the chatbot request is sent through Express rather than directly from the browser.
- Current CORS is open for local development. Restrict allowed origins before deployment.
- Add rate limiting, request logging, error monitoring, backup/recovery procedures, and automated tests before a production launch.
- Validate file content and upload size at the storage edge for production; MIME checks alone are not a complete malware-control strategy.

## 13. Current limitations

- No payment gateway, payment verification, receipts, or transaction UI exists. `Paid` is a workflow marker only.
- No notifications, maps, dispatch optimization, edits/deletes for catalog entries, search/pagination, analytics, password reset, or audit log is implemented.
- Service-center selection is automatic for catalog models when a linked center exists; there is no geographic routing or customer choice.
- Custom Other-brand requests deliberately do not create a new global company/model/service-center record.
- Transaction and device-status-history schemas are not yet integrated into the application.
- The chatbot requires a valid Groq configuration and only answers AAMigos-related questions.
