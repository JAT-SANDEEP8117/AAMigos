import bcrypt from "bcrypt";
import Admin from "../models/admins.js";

export const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    console.warn("Admin seed skipped: ADMIN_EMAIL and ADMIN_PASSWORD are not configured");
    return;
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({ name, email, password: hashedPassword });
  console.log("Seeded admin account");
};
