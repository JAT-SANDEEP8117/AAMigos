import User from "../models/users.js";
import Agent from "../models/agents.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const validateCredentials = (email, password, res) => {
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return false;
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return false;
  }
  return true;
};

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateCredentials(email, password, res)) return;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({ token, role: "customer", message: "User registered successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).json({ token, role: "customer", message: "User logged in successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerAgent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateCredentials(email, password, res)) return;

    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newAgent = new Agent({ email, password: hashedPassword });
    await newAgent.save();

    const token = jwt.sign(
      { agentId: newAgent._id, role: "agent" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({ token, role: "agent", message: "Agent registered successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { agentId: agent._id, role: "agent" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).json({ token, role: "agent", message: "Agent logged in successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
