import express, { Router } from "express";
import {
    createCategory,
    getAllCategories
} from "../controllers/categoryController.js";
import { protect, authorize } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post("/categories", protect, authorize('admin'), createCategory);
router.get("/categories", getAllCategories);

export default router;