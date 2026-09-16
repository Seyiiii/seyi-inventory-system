import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUserRole, deleteUser } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';


const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/users', protect, authorize('super_admin', 'admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('super_admin', 'admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('super_admin', 'admin'), deleteUser);

export default router;