import mongoose from "mongoose";

const VolumeProfile = new mongoose.Schema({
    manga_id: { type: String, required: true },
    volume_id: { type: String, required: true, unique : true },
    volume_title: { type: String, required: true },
    volume_number : { type: Number, required: true },
    description: { type: String },
    
    cover_image: { type: String, required: true },
    // gallery: { type: [String], default: [] },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    created_by: {
        type: String,
        required: true
    }
    // rating: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model("Volumes", VolumeProfile);