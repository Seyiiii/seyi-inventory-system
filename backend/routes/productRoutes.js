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
} from '../controllers/productController.js';
import {
    createStockMovement,
    getAllStockMovements,
    getProductStockMovements
} from '../controllers/stockMovementController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.get('/products/stats', protect, authorize('admin', 'manager'), getProductStats); // 👈 ADD
router.get('/products/low-stock', protect, authorize('admin', 'manager', 'storekeeper'), getLowStockProducts);
router.get('/products/recommended', getRecommendations);
router.get('/stock-movements', protect, authorize('admin', 'storekeeper'), getAllStockMovements);

router.get('/products', getAllProducts);
router.post('/products', protect, authorize('admin', 'storekeeper'), upload.single('image'), createProduct);

router.post('/products/:id/stock', protect, authorize('admin', 'storekeeper'), createStockMovement);
router.get('/products/:id/price/:currencyCode', getProductPriceInCurrency);
router.get('/products/:id/stock', protect, authorize('admin', 'storekeeper'), getProductStockMovements);

router.get('/products/:id', getProductById);
router.patch('/products/:id', protect, authorize('admin', 'storekeeper'), updatedProduct);
router.delete('/products/:id', protect, authorize('admin', 'storekeeper'), deleteProduct);

export default router;