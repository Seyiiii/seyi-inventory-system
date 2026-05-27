import Product from '../models/productModel.js';
import asyncHandler from "../middlewares/asyncHandler.js";
import StockMovement from '../models/stockMovementModel.js';
import AuditLog from '../models/auditLogModel.js';



export const createProduct = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;

    if (req.file) {
        req.body.image = req.file.path;
    }

    const newProduct = await Product.create(req.body);

        if (newProduct.stock_quantity > 0) {
            await StockMovement.create({
                product: newProduct._id,
                user: req.user.id,
                previous_quantity: 0,
                new_quantity: newProduct.stock_quantity,
                quantity_change: newProduct.stock_quantity,
                type: 'IN'
            });
        }

    res.status(201).json({
        message: "Product created successfully!!",
        product: newProduct
    });
});

export const getAllProducts = asyncHandler(async (req, res) => {

    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit =  Number(req.query.limit) || 20;

    let filter = {};

    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);


    const products = await Product.find(filter)
    .populate('category_id', 'name')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.status(200).json({
        count: products.length,
        page: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        products: products
});

});

export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    .populate('category_id', 'name');

    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }
    res.status(200).json({ product });
});

export const updatedProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found. Cannot Update.");
    }

    if (req.user.role === 'storekeeper' && product.user.toString() != req.user.id) {
        res.status(403);
        throw new Error("You  are not authorized to edit a product that you did not create.");
    }

    if (req.file) {
        req.body.image = req.file.path;
    }

    if (req.body.stock_quantity !== undefined) {
        const newQty = Number(req.body.stock_quantity);
        const oldQty = product.stock_quantity;

        if (newQty !== oldQty) {
            const diff = newQty - oldQty;
            await StockMovement.create({
                product: id,
                user: req.user.id,
                previous_quantity: oldQty,
                new_quantity: newQty,
                quantity_change: Math.abs(diff),
                type: diff > 0 ? 'IN' : 'OUT'
            });
        }
    }

     if (req.body.price && Number(req.body.price) !== product.price) {
        await AuditLog.create({
            action: 'PRICE_CHANGE',
            user: req.user.id,
            product: id,
            details: `Price changed from NGN ${product.price} to NGN ${req.body.price}`
        });
    }

    if (req.body.name && req.body.name !== product.name) {
        await AuditLog.create({
            action: 'NAME_CHANGE',
            user: req.user.id,
            product: id,
            details: `Name changed from ${product.name} to ${req.body.name}`
        });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        req.body,
        {
            returnDocument: 'after',
            runValidators: true
        }
    );

    res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct
    });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found. Cannot delete.");
    }

    if (req.user.role === 'storekeeper' && product.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error("You are not authorized to delete a product that you did not create.");
    }

    await AuditLog.create({
        action: 'PRODUCT_DELETED',
        user: req.user.id,
        product: id,
        details: `Deleted product: "${product.name}" (SKU: ${product.sku || 'N/A'})`
    });

    await Product.findByIdAndDelete(id);


    res.status(200).json({
        message: "Product deleted successfully!",
        id: id
    });
});


export const getLowStockProducts = asyncHandler(async (req, res) => {
    const lowStockItems = await Product.find({
        $expr: { $lte: ["$stock_quantity", "$low_stock_threshold"] }
    })
    .populate('category_id', 'name')
    .sort({ stock_quantity: 1 });

    res.status(200).json({
        count: lowStockItems.length,
        alert_status: "Low Stock Alert",
        products: lowStockItems
    });
});

// External API endpoint to fetch PRoducts prices in different currencies
export const getProductPriceInCurrency = asyncHandler(async (req, res) => {
    const { id, currencyCode } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }

    const targetCurrency = currencyCode.toUpperCase();

    const apiUrl = `https://open.er-api.com/v6/latest/${product.base_currency}`;

    try {
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.result !== "success") {
            res.status(502);
            throw new Error("Failed to fetch live exchange rates.");
        }

        if (!data.rates[targetCurrency]) {
            res.status(400);
            throw new Error(`Currency code '${targetCurrency}' is not supported.`);
        }

        const exchangeRate = data.rates[targetCurrency];
        const convertedPrice = product.price * exchangeRate;

        res.status(200).json({
            product_name: product.name,
            base_price: product.price,
            base_currency: product.base_currency,
            target_currency: targetCurrency,
            exchange_rate: exchangeRate,
            converted_price: Number(convertedPrice.toFixed(2))
        });
    } catch (error) {
        res.status(500);
        throw new Error(`External API Error: ${error.message}`);        
    }
})


// BACKEND: productController.js
export const getRecommendations = asyncHandler(async (req, res) => {
    // 1. Read the favorite category sent from the frontend
    const { category } = req.query;

    let pipeline = [];

    // 2. If they have a favorite category, filter for it. If not, just pick from everything!
    // Note: Adjust 'category_id' if you are querying by the raw ObjectId, or keep it generic if searching text.
    if (category) {
        pipeline.push({ 
            // We use a regex here just in case 'category' is a string name
            $match: { name: { $exists: true } } // Placeholder: In a real app, match the exact category ID here
        });
    }

    // 3. The Magic Command: Tell MongoDB to randomly grab exactly 4 items
    pipeline.push({ $sample: { size: 4 } });

    // Execute the aggregation
    const recommendedProducts = await Product.aggregate(pipeline);

    res.status(200).json(recommendedProducts);
});

export const getProductStats = asyncHandler(async (req, res) => {
   const [totalProducts, outOfStock, lowStock, categories] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock_quantity: 0 }),
    Product.countDocuments({ stock_quantity: {$gt: 0, $lte: 10 } }),
    Product.distinct('category_id')
   ]);

    res.status(200).json({
        totalProducts,
        outOfStock,
        lowStock,
        totalCategories: categories.length
    });
});

export const getAuditLogs = asyncHandler(async (req, res) => {

    const logs = await AuditLog.find({})
        .populate('user', 'name email role')
        .populate('product', 'name sku')
        .sort({ createdAt: -1 })
        .limit(100);

    res.status(200).json(logs);
});