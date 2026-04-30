import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) =>{
    req.body.user = req.user.id;
    const newCategory = await Category.create(req.body);

    res.status(201).json({
        message: "Category created successfully!!",
        category: newCategory
    });
});

export const getAllCategories = asyncHandler(async (req, res) =>{
    const categories = await Category
    .find().sort({ name: 1})
    .populate('user', 'user email role')

    res.status(200).json({ categories });
});