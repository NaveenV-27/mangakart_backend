"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const VolumeProfile = new mongoose_1.default.Schema({
    manga_id: { type: String, required: true },
    volume_id: { type: String, required: true, unique: true },
    volume_title: { type: String, required: true },
    volume_number: { type: Number, required: true },
    description: { type: String },
    cover_image: { type: String, required: true },
    // gallery: { type: [String], default: [] },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    // rating: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
exports.default = mongoose_1.default.model("Volumes", VolumeProfile);
