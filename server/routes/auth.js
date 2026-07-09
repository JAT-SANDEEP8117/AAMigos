import express from 'express';
import { loginAdmin, loginAgent, loginUser, registerAgent, registerUser } from '../controllers/authControllers.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Auth route");
})
router.post('/user/register' , registerUser);

router.post('/user/login', loginUser);

router.post('/agent/register', registerAgent);

router.post('/agent/login', loginAgent);

router.post('/admin/login', loginAdmin);

export default router;
