import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['PRICE_CHANGE', 'NAME_CHANGE', 'PRODUCT_DELETED', 'PRODUCT_SAVED']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    details: {
        type: String,
        required: true
    }
}, {
        timestamps: true
});

export default mongoose.model('AuditLog', auditLogSchema);