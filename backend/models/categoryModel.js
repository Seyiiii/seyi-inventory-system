import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true
    },

    description: {
        type: String,
    }
}, {
    timestamps: true
});

export default mongoose.model('Category', categorySchema)