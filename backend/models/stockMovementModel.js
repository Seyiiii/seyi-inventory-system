import mongoose from "mongoose";

const  stockMovementSchema = new mongoose.Schema({
    product: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    previous_quantity: {
        type: Number,
        required: true,
        min: 0
    },
    new_quantity: {
        type: Number,
        required: true,
        min: 0
    },
    quantity_change: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum:  ['IN', 'OUT'],
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('StockMovement', stockMovementSchema);