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

router.post('/orders', protect, createOrder);
router.get('/orders/my-orders', protect, getMyOrders);
router.get('/orders/all', protect, authorize('admin', 'manager'), getAllOrders);
router.get('/orders/:id', protect, getOrderById);
router.patch('/orders/:id/deliver', protect, authorize('admin'), markAsDelivered);

export default router;