"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mangaProfile = new mongoose_1.default.Schema({
    manga_id: { type: String, required: true, unique: true },
    title: { type: String, required: true, unique: true },
    description: { type: String },
    authors: { type: [String], required: true },
    genres: { type: [String], required: true },
    cover_image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    // price: { type: Number, required: true },
    // stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
exports.default = mongoose_1.default.model("Manga", mangaProfile);
