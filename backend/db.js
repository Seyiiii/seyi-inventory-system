import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";

dotenv.config();

if (process.env.NODE_ENV !== "production") {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB!!');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err.message);
        process.exit(1);
    }
};

export default connectDB;