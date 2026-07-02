# AAMigos — Setup Guide

The **full frontend and backend are complete**. You only need to configure your `.env` file and populate MongoDB with catalog data.

---

## 1. Environment Variables (Only thing you must configure)

Edit `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGO_URI` | Yes | MongoDB Atlas or local connection string |
| `JWT_SECRET` | Yes | Signs login tokens (use 32+ random characters) |
| `PORT` | No | Server port (default `5000`) |
| `CLOUDINARY_*` | Yes | Profile photos + invoice PDF uploads |

**Optional client env** (`client/.env`):
```env
VITE_API_URL=/api
```
Change to your production API URL when deploying (e.g. `https://api.yoursite.com/api`).

---

## 2. Run the Project

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health

---

## 3. MongoDB Database Design

Create these collections in MongoDB. Insert **catalog data first** before customers can place repair orders.

### Collection: `devicecategories`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | Yes | Must be one of: `Smartphones`, `Tablets`, `Laptops` |

**Example documents:**
```json
{ "name": "Smartphones" }
{ "name": "Tablets" }
{ "name": "Laptops" }
```

---

### Collection: `companies`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | Yes | e.g. "Samsung", "Apple", "Dell" |
| `categories` | ObjectId[] | Yes | References to `devicecategories._id` |
| `models` | ObjectId[] | No | References to `devicemodels._id` |
| `serviceCenters` | ObjectId[] | No | References to `servicecenters._id` |

**Example:**
```json
{
  "name": "Samsung",
  "categories": ["<smartphones_category_id>"],
  "models": [],
  "serviceCenters": []
}
```

---

### Collection: `devicemodels`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | Yes | e.g. "Galaxy S21" |
| `img` | String | No | Image URL for UI |
| `company` | ObjectId | Yes | Reference to `companies._id` |
| `category` | ObjectId | Yes | Reference to `devicecategories._id` |

**Example:**
```json
{
  "name": "Galaxy S21",
  "img": "https://example.com/galaxy-s21.png",
  "company": "<samsung_company_id>",
  "category": "<smartphones_category_id>"
}
```

---

### Collection: `servicecenters`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | Yes | Service center name |
| `city` | String | No | City name |
| `companies` | ObjectId[] | Yes | Which brands this center handles |
| `address.street` | String | Yes | Street address |
| `address.city` | String | Yes | City |
| `address.pincode` | String | Yes | 6-digit pincode |
| `contactNumber` | String | No | Phone number |

**Example:**
```json
{
  "name": "Samsung Service Center Bangalore",
  "city": "Bangalore",
  "companies": ["<samsung_company_id>"],
  "address": {
    "street": "MG Road",
    "city": "Bangalore",
    "pincode": "560001"
  },
  "contactNumber": "9876543210"
}
```

> **Important:** Each company used in device models must have at least one linked service center, or new repair orders will fail.

---

### Collection: `users` (auto-created on signup)

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Unique, required |
| `password` | String | Bcrypt hashed |
| `name` | String | Set during onboarding |
| `phone` | String | Set during onboarding |
| `profilePicture` | String | Cloudinary URL |
| `address.dno` | String | Door / apartment |
| `address.street` | String | Street |
| `address.city` | String | City |
| `address.pincode` | String | Pincode |
| `requests` | ObjectId[] | Linked repair requests |

---

### Collection: `agents` (auto-created on signup)

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Unique, required |
| `password` | String | Bcrypt hashed |
| `name` | String | Set during onboarding |
| `phone` | String | Set during onboarding |
| `profilePicture` | String | Cloudinary URL |
| `panCard` | String | Agent KYC |
| `aadharNumber` | String | Agent KYC |
| `address` | Object | Same structure as users |
| `assignedRequests` | ObjectId[] | Assigned repair requests |

---

### Collection: `devices` (auto-created on new order)

| Field | Type | Notes |
|-------|------|-------|
| `imeiNumber` | String | Unique |
| `invoicePdfUrl` | String | Cloudinary PDF URL |
| `model` | ObjectId | Reference to `devicemodels._id` |
| `owner` | ObjectId | Reference to `users._id` |
| `warranty` | Boolean | Under warranty or not |
| `issue` | String | Problem description |

---

### Collection: `requests` (auto-created on new order)

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Customer |
| `device` | ObjectId | Device being repaired |
| `status` | String | See status flow below |
| `FreeService` | Boolean | Warranty free repair flag |
| `assignedAgent` | ObjectId | Agent handling pickup |
| `selectedServiceCenter` | ObjectId | Repair center |
| `affordable` | Map | Repair package tier 1 |
| `goodToHave` | Map | Repair package tier 2 |
| `niceToHave` | Map | Repair package tier 3 |
| `userPackage` | String | Customer's chosen package |
| `amountDue` | Number | Default 300 |
| `isPaid` | Boolean | Payment status |
| `createdAt` | Date | Auto timestamp |

**Status flow:**
```
Pending → Approved → PickedUp → FreeApproval → InRepair → Delivering → Paid → Completed
                                                                              ↘ Cancelled (customer, while Pending only)
```

---

## 4. Sample Seed Data (Copy into MongoDB)

Insert in this order:

### Step 1 — Categories
```javascript
db.devicecategories.insertMany([
  { name: "Smartphones" },
  { name: "Tablets" },
  { name: "Laptops" }
]);
```

### Step 2 — Companies (replace category IDs)
```javascript
const smartphoneId = db.devicecategories.findOne({ name: "Smartphones" })._id;

db.companies.insertOne({
  name: "Samsung",
  categories: [smartphoneId],
  models: [],
  serviceCenters: []
});
```

### Step 3 — Device Models
```javascript
const samsung = db.companies.findOne({ name: "Samsung" });

db.devicemodels.insertOne({
  name: "Galaxy S21",
  img: "",
  company: samsung._id,
  category: smartphoneId
});
```

### Step 4 — Service Centers
```javascript
db.servicecenters.insertOne({
  name: "Samsung SC Bangalore",
  city: "Bangalore",
  companies: [samsung._id],
  address: { street: "MG Road", city: "Bangalore", pincode: "560001" },
  contactNumber: "9876543210"
});
```

---

## 5. Application Features (All Built)

### Customer (`/customer`)
- Dashboard with order stats
- Schedule new repair pickup (category → company → model → issue + invoice)
- View all / pending / active orders
- Track repair progress timeline
- Select repair package (after agent sets options)
- Cancel pending orders

### Agent (`/agent`)
- Dashboard with job stats
- View & approve pending pickup requests
- Manage ongoing jobs
- View all assigned orders
- Advance repair status step-by-step
- Set repair package options (affordable / good / premium)
- Approve free warranty service

### Auth & Onboarding
- Customer & agent login/signup with JWT
- Multi-step onboarding with profile photo upload
- Agent KYC (Aadhaar + PAN)

---

## 6. Deployment Notes

1. Set all `server/.env` variables on your host
2. Build frontend: `cd client && npm run build`
3. Set `VITE_API_URL` to production API before building
4. Enable CORS for your frontend domain if needed
5. Never commit `.env` to git

---

You're ready to go once `.env` is filled and catalog data is in MongoDB!
