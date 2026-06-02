import jwt from "jsonwebtoken";
import User from  '../models/userModel.js';
import asyncHandler from "../middlewares/asyncHandler.js";
import sendEmail from "../utilities/sendEmail.js";


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};



export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please insert all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('"User with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    if (user) {
        setTimeout(() => {
            sendEmail({
                email: user.email,
                subject: 'Welcome to the Inventory System 🎉',
                html: welcomeTemplate({ name: user.name, role: user.role })
            }).then(() => {
                console.log('Welcome email sent successfully to:', user.email);
            }).catch((error) => {
                console.error('CRITICAL EMAIL ERROR:', error.message);
            });
        }, 0);

        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data")
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide both email and  password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password')
        .sort({ createdAt: -1 });

    res.status(200).json({
        users,
        totalUsers: users.length
    });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ['user', 'storekeeper', 'manager', 'admin'];

    if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.role = role;
    const updatedUser = await user.save();

    updatedUser.password = undefined;
    
    res.status(200).json({
        message: `User role updated to ${role}`,
        user: updatedUser
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.id.toString() === req.user.id.toString()) {
        res.status(400);
        throw new Error('You cannot delete your own account');
    }

    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
        res.status(403);
        throw new Error('You do not have permission to delete a super admin account');
    }

    if (user.role === 'admin' && req.user.role === 'admin') {
        res.status(403);
        throw new Error('Admins cannot delete other admin accounts');
    }

    await user.deleteOne({ _id: user._id });

    res.status(200).json({
        message: 'User deleted successfully'
    });
})