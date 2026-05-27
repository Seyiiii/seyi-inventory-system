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
        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to the Inventory System',
                message: `Hi ${user.name}, \n\nWelcome to our platform. Your account has been created successfully. You are registered in the team as ${user.role}. \n\nBest Regards, \n\nInventory System Team`
            })
        } catch (error) {
            console.error('Email could not be sent out:', error);
        }
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
    let query = {};

    if (req.user.role === 'admin') {
        query = { role: { $in: ['manager', 'storkeeper', 'user']} };
    }
    const users = await User.find({}).select('-password')
        .sort({ createdAt: -1 });

    res.status(200).json({
        users,
        totalUsers: users.length
    });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (role === 'super_admin') {
        res.status(403);
        throw new Error('Super Admin role can only be assigned via database console')
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'super_admin') {
        res.status(403);
        throw new Error('You don not have permission to modify a Super Admin');
    }

    if (user.role === 'admin' && req.user.role === 'admin') {
        res.status(403);
        throw new Error('Admins do not have permission to modify other Admins');
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

    // 🔒 BACKEND SECURITY CHECKS
    // 1. Self-preservation: Prevent an admin from accidentally deleting their own account via API
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot delete your own account');
    }

    // 2. Hierarchy rule: Regular admins cannot delete a super_admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
        res.status(403);
        throw new Error('You do not have permission to delete a Super Admin');
    }

    if (user.role === 'admin' && req.user.role === 'admin') {
        res.status(403);
        throw new Error('Admins do not have permission to delete other Admins');
    }

    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: 'User deleted successfully' });
});