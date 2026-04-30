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