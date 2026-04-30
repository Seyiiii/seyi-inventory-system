import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);

app.use(errorHandler);

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    });
};

startServer();