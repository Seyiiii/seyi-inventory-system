import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please insert your name"] 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please insert a valid email'
        ]
    },
    password: {
        type:  String,
        required: true,
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },
    role: {
        type:  String,
        enum: ['user', 'storekeeper', 'manager', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);