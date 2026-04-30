import express from "express";
import { createOrder, getOrderById, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/orders', protect, createOrder);
router.get('/orders/my-orders', protect, getMyOrders);
router.get('/orders/:id', protect, getOrderById);

export default router;