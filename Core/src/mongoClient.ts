import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
const mongoUri = process.env.MONGO_URL || "mongodb://root:root@localhost:27017/stockwatch?authSource=admin";

export const connectMongo = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};
