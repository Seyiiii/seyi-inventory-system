import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUserRole } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, authorize('super_admin', 'admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('super_admin', 'admin'), updateUserRole);

export default router;