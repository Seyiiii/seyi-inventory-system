import Product from '../models/productModel.js';
import StockMovement from '../models/stockMovementModel.js';
import asyncHandler from "../middlewares/asyncHandler.js";


export const createStockMovement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type, quantity } = req.body;

    if (!type || !quantity) {
        res.status(400);
        throw new Error("Please provide both 'type' (IN/OUT) and 'quantity'." );
    }

    if (!['IN', 'OUT'].includes(type.toUpperCase())) {
        res.status(400);
        throw new Error("Type must be either 'IN' or 'OUT'.");
    }

    const product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error("Product does not exist.");
    }

    const numericQuantity = Number(quantity);

    if (type.toUpperCase() === 'OUT' && numericQuantity > product.stock_quantity) {
        res.status(400);
        throw new Error(`Insuffient stock for this operation. we only have ${product.stock_quantity} in stock.`);
    }

    const previous_quantity = product.stock_quantity;
    let new_quantity;

    if (type.toUpperCase() === 'IN') {
        new_quantity = previous_quantity + numericQuantity;
    } else {
        new_quantity = previous_quantity - numericQuantity;
    }

    const stockMovement = await StockMovement.create ({
        product: id,
        user: req.user.id,
        previous_quantity: previous_quantity,
        new_quantity: new_quantity,
        quantity_change: numericQuantity,
        type: type.toUpperCase()
    });

    product.stock_quantity = new_quantity;
    await product.save();

    res.status(201).json({
        message: "Stock updated successfully!",
        current_stock: product.stock_quantity,
        audit_record: stockMovement
    });
});

export const getProductStockMovements = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const movements = await StockMovement.find({ product: id})
        .populate('user', 'name role')
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: movements.length,
            product_id: id,
            movements
        });
});

export const getAllStockMovements = asyncHandler(async (req, res) => {
    const movements = await  StockMovement.find()
        .populate('product', 'name sku price')
        .populate('user', 'name role email')
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: movements.length,
            movements
        });
});