"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongo = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri)
            throw new Error("MONGO_URI is not defined in .env");
        await mongoose_1.default.connect(uri);
        console.log("MongoDB connected");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
exports.default = connectMongo;
