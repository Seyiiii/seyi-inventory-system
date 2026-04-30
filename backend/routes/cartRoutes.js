import express from 'express';
import { addToCart, getCart, clearcart, removeItemFromCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/cart', protect, addToCart);
router.get('/cart', protect, getCart);
router.delete('/cart/:productId', protect, removeItemFromCart);
router.delete('/cart', protect, clearcart);

export default router;
