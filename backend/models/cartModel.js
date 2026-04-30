import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity can not be less than 1.']
    },
    price: {
        type: Number,
        required: true
    }
}, {
    _id: false
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


cartSchema.pre('save', function () {
    this.totalPrice = this.items.reduce((total, item) => {
        return total + (item.quantity * item.price);
    }, 0);
});

export default mongoose.model('Cart', cartSchema);