import mongoose from "mongoose";

const mangaProfile = new mongoose.Schema({
    manga_id: { type: String, required: true, unique : true },
    title: { type: String, required: true, unique : true },
    description: { type: String },
    authors: { type: [String], required: true },
    genres: { type: [String], required: true },
    cover_image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    // price: { type: Number, required: true },
    // stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model("Manga", mangaProfile);