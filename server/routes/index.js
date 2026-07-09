import express from 'express';
import authRoutes from './auth.js';
import setupRoutes from './setup.js';
import agentRoutes from './agentMain.js'
import customerRoutes from './customerMain.js'
import requestRoutes from './request.js';
import chatbotRoutes from './chatbot.js';
import adminRoutes from './admin.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/setup' , setupRoutes);
router.use('/agent', agentRoutes);
router.use('/customer', customerRoutes);
router.use('/request', requestRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/admin', adminRoutes);

export default router;
