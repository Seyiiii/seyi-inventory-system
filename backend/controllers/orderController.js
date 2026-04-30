import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import StockMovement from '../models/stockMovementModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import sendEmail from '../utilities/sendEmail.js';
import { orderReceiptTemplate } from '../utilities/emailTemplates.js';

export const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error('Your cart is empty. No Product to Checkout.');
    }

    // Step 1: Check ALL stock BEFORE creating anything
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        if (product.stock_quantity < item.quantity) {
            res.status(400);
            throw new Error(`Sorry, "${product.name}" only has ${product.stock_quantity} units left in stock!`);
        }
    }

    // Step 2: Safe to create the order
    const orderItems = cart.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.image,
        price: item.price,
        product: item.product._id
    }));

    const generatedOrderNumber = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const order = await Order.create({
        user: userId,
        orderNumber: generatedOrderNumber,
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice: cart.totalPrice
    });

    // Step 3: Deduct stock and log movements
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        const previous_quantity = product.stock_quantity;
        product.stock_quantity -= item.quantity;
        await product.save();

        await StockMovement.create({
            product: product._id,
            user: userId,
            previous_quantity,
            new_quantity: product.stock_quantity,
            quantity_change: item.quantity,
            type: 'OUT'
        });
    }

    // Step 4: Clear the cart
    cart.items = [];
    await cart.save();

    // Step 5: Send receipt email
    const itemsList = order.orderItems
        .map(item => `  • ${item.name}  x${item.quantity}  —  NGN ${(item.price * item.quantity).toLocaleString()}`)
        .join('\n');

   try {
    await sendEmail({
        email: req.user.email,
        subject: `Order Confirmed — ${order.orderNumber} 🎉`,
        html: orderReceiptTemplate({ name: req.user.name, order })
    });
} catch (emailError) {
    console.error('Receipt email failed to send:', emailError);
}

    res.status(201).json({
        message: 'Order placed successfully!',
        order
    });
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.status(200).json({ order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
});