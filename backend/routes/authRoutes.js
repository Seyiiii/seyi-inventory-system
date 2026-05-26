import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUserRole, deleteUser } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/users', protect, authorize('admin', 'super_admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin', 'super_admin'), updateUserRole);

router.delete('/users/:id', protect, authorize('admin', 'super_admin'), deleteUser);

export default router;