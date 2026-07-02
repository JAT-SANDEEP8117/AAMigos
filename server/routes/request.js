import express from 'express';
import { verifyToken, verifyUser } from '../middlewares/authMiddleware.js';
import { getCategories, getCompanies, getModels, postRequest } from '../controllers/requestControllers.js';
const router = express.Router();
import multer from 'multer';
import {storage} from '../cloudConfig.js';
const upload = multer({storage});

router.get("/categories", verifyToken, verifyUser, getCategories);

router.get("/companies/:category", verifyToken , verifyUser, getCompanies );

router.get("/models/:category/:company", verifyToken, verifyUser, getModels );

router.post("/newOrder", verifyToken, verifyUser, upload.single("invoice"), postRequest);

export default router;