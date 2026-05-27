import express from 'express';
import {
    createProduct,
    getAllProducts,
    updatedProduct,
    deleteProduct,
    getProductById,
    getLowStockProducts,
    getProductPriceInCurrency,
    getRecommendations,
    getProductStats        // 👈 ADD
    getAuditLogs
} from '../controllers/productController.js';
import {
    createStockMovement,
    getAllStockMovements,
    getProductStockMovements
} from '../controllers/stockMovementController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.get('/products/stats', protect, authorize('super_admin', 'admin', 'manager'), getProductStats); // 👈 ADD
router.get('/products/low-stock', protect, authorize('super_admin', 'admin', 'manager', 'storekeeper'), getLowStockProducts);
router.get('/products/recommended', getRecommendations);
router.get('/stock-movements', protect, authorize('super_admin', 'admin', 'storekeeper'), getAllStockMovements);
router.get('/audit-logs', protect, authorize('super_admin'), getAuditLogs);


router.get('/products', getAllProducts);
router.post('/products', protect, authorize('super_admin', 'admin', 'storekeeper'), upload.single('image'), createProduct);

router.post('/products/:id/stock', protect, authorize('super_admin', 'admin', 'storekeeper'), createStockMovement);
router.get('/products/:id/price/:currencyCode', getProductPriceInCurrency);
router.get('/products/:id/stock', protect, authorize('super_admin', 'admin', 'storekeeper'), getProductStockMovements);

router.get('/products/:id', getProductById);
router.patch('/products/:id', protect, authorize('super_admin', 'admin', 'storekeeper'), upload.single('image'), updatedProduct);
router.delete('/products/:id', protect, authorize('super_admin', 'admin', 'storekeeper'), deleteProduct);

export default router;