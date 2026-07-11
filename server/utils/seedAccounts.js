import bcrypt from "bcrypt";
import User from "../models/users.js";
import Agent from "../models/agents.js";

const demoAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c45f2f&color=fff`;

export const seedCustomer = async () => {
  const email = process.env.CUSTOMER_EMAIL?.trim().toLowerCase();
  const password = process.env.CUSTOMER_PASSWORD?.trim();
  const name = process.env.CUSTOMER_NAME?.trim() || "Demo Customer";

  if (!email || !password) {
    console.warn("Customer seed skipped: CUSTOMER_EMAIL and CUSTOMER_PASSWORD are not configured");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    email,
    password: hashedPassword,
    name,
    phone: process.env.CUSTOMER_PHONE?.trim() || "9876543210",
    profilePicture: demoAvatar(name),
    address: {
      dno: "12-A",
      street: "MG Road",
      city: "Bangalore",
      pincode: "560001",
    },
  });
  console.log("Seeded customer account");
};

export const seedAgent = async () => {
  const email = process.env.AGENT_EMAIL?.trim().toLowerCase();
  const password = process.env.AGENT_PASSWORD?.trim();
  const name = process.env.AGENT_NAME?.trim() || "Demo Agent";

  if (!email || !password) {
    console.warn("Agent seed skipped: AGENT_EMAIL and AGENT_PASSWORD are not configured");
    return;
  }

  const existing = await Agent.findOne({ email });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  await Agent.create({
    email,
    password: hashedPassword,
    name,
    phone: process.env.AGENT_PHONE?.trim() || "9876501234",
    profilePicture: demoAvatar(name),
    panCard: process.env.AGENT_PAN?.trim() || "ABCDE1234F",
    aadharNumber: process.env.AGENT_AADHAAR?.trim() || "123456789012",
    address: {
      dno: "45-B",
      street: "Brigade Road",
      city: "Bangalore",
      pincode: "560025",
    },
  });
  console.log("Seeded agent account");
};
