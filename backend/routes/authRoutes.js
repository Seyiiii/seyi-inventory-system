import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUserRole } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

export default router;