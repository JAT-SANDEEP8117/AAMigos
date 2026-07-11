import User from "../models/users.js";
import Agent from "../models/agents.js";

export const setupUser = async (req, res) => {
  try {
    const { name, phone, dno, street, city, pincode } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }
    if (!name || !phone || !dno || !street || !city || !pincode) {
      return res.status(400).json({ message: "All profile fields are required" });
    }
    if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number and 6-digit pincode" });
    }
    if (!req.file.mimetype?.startsWith("image/")) {
      return res.status(400).json({ message: "Profile picture must be an image" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.phone = phone;
    user.address = { dno, street, city, pincode };
    user.profilePicture = req.file.path;
    await user.save();
    res.status(201).json({ message: "User updated successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setupAgent = async (req, res) => {
  try {
    const { name, phone, dno, street, city, pincode, panCard, adhaarNumber } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }
    if (!name || !phone || !dno || !street || !city || !pincode || !panCard || !adhaarNumber) {
      return res.status(400).json({ message: "All profile fields are required" });
    }
    if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(pincode) || !/^[A-Z]{5}\d{4}[A-Z]$/.test(panCard) || !/^\d{12}$/.test(adhaarNumber)) {
      return res.status(400).json({ message: "Enter valid contact, address, PAN, and Aadhaar details" });
    }
    if (!req.file.mimetype?.startsWith("image/")) {
      return res.status(400).json({ message: "Profile picture must be an image" });
    }

    const agent = await Agent.findById(req.user.agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    agent.name = name;
    agent.phone = phone;
    agent.address = { dno, street, city, pincode };
    agent.panCard = panCard;
    agent.aadharNumber = adhaarNumber;
    agent.profilePicture = req.file.path;
    await agent.save();
    res.status(201).json({ message: "Agent updated successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
