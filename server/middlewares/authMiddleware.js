import jwt from "jsonwebtoken";
import User from "../models/users.js";
import Agent from "../models/agents.js";
import Admin from "../models/admins.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied, token missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const verifyAgent = async (req, res, next) => {
  try {
    if (req.user.role !== "agent" || !req.user.agentId) {
      return res.status(403).json({ message: "Access denied, agent only" });
    }
    const agent = await Agent.findById(req.user.agentId);
    if (!agent) return res.status(403).json({ message: "Access denied, agent only" });
    req.agent = agent;
    next();
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    if (req.user.role !== "customer" || !req.user.userId) {
      return res.status(403).json({ message: "Access denied, customer only" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(403).json({ message: "Access denied, customer only" });
    req.userDetails = user;
    next();
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin" || !req.user.adminId) {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    const admin = await Admin.findById(req.user.adminId);
    if (!admin) return res.status(403).json({ message: "Access denied, admin only" });
    req.admin = admin;
    next();
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
