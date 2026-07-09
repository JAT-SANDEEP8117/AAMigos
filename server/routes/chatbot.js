import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { sendChatbotMessage } from "../controllers/chatbotControllers.js";

const router = express.Router();

router.post("/message", verifyToken, sendChatbotMessage);

export default router;
