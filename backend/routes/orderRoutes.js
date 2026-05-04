import express from "express";
import { 
    createOrder, 
    getOrderById, 
    getMyOrders,
    getAllOrders,
    markAsDelivered
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/orders/my-orders', protect, getMyOrders);
router.get('/orders/all', protect, authorize('admin', 'manager'), getAllOrders);
router.post('/orders', protect, createOrder);
router.patch('/orders/:id/deliver', protect, authorize('admin'), markAsDelivered);
router.get('/orders/:id', protect, getOrderById);

export default router;