import express from 'express';
import { addToCart, getCart, clearcart, removeItemFromCart, updateCartItem } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js'
import { cartLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/cart', protect, cartLimiter, addToCart);
router.get('/cart', protect, getCart);
router.delete('/cart/:productId', protect, cartLimiter, removeItemFromCart);
router.patch('/cart/:productId', protect, cartLimiter, updateCartItem);
router.delete('/cart', protect, cartLimiter, clearcart);

export default router;
