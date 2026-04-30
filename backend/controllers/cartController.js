import asyncHandler from '../middlewares/asyncHandler.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';


export const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found in inventory');
    }

    if (product.stock_quantity < quantity) {
        res.status(400);
        throw new Error(`Only ${product.stock_quantity} left in stock.`);
    }
    
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
            quantity: quantity,
            price: product.price
        });
    }

    await cart.save();

    res.status(200).json({
        message: 'Item added to cart successfully',
        cart
    });

});

export const getCart = asyncHandler(async (req, res) => {
    const userId =req.user.id;
    
    const cart = await Cart.findOne({ user: userId })
        .populate({
            path: 'items.product',
            select: 'name sku price image'
        });

    if (!cart) {
        return res.status(200).json({
            message: "your cart is empty",
            cart: {
                items: [],
                totalPrice: 0
            }
        });
    }

    res.status(200).json({
        cart
    });
});

export const removeItemFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    // Filter out the item with this productId
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    // Recalculate total
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId })
        .populate('items.product');

    res.status(200).json({
        message: 'Item removed from cart',
        cart: updatedCart
    });
});

export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1')
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
        res.status(400);
        throw new Error('Item not found in cart');
    }

    const product = await Product.findById(productId);
    if (product.stock_quantity < quantity) {
        res.status(400);
        throw new Error(`Only ${product.stock_quantity} left in stock.`)
    }

    item.quantity = quantity;
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId })
        .populate('items.product');

    res.status(200).json({
        message: 'Cart updated successfully',
        cart: updatedCart
    })
});

export const clearcart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }
    cart.items = [];

    await cart.save();

    res.status(200).json({
        message: 'Cart cleared successfully!!',
        cart
    });
});