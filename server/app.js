import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { seedCatalog } from "./utils/seedCatalog.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { seedCustomer, seedAgent } from "./utils/seedAccounts.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    await seedCatalog();
    await seedAdmin();
    await seedCustomer();
    await seedAgent();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
await connectDb();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
