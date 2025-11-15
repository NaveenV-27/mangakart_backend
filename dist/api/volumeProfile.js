"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Volume_1 = __importDefault(require("../MongoModels/Volume"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// Configure multer-storage-cloudinary
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'avif'],
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const volumeRouter = express_1.default.Router();
volumeRouter.post("/create_volume", upload.single('cover_image'), // match the input file field name from the form
async (req, res, next) => {
    try {
        // console.log("Request recieved:", req.body);
        const { title, price, description, cover_image_url, stock, manga_id, volume_number, } = req.body;
        const mm = title
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
        const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
        const volume_id = `VOL${mm}${randomDigits}`;
        const payload = {
            volume_id,
            manga_id,
            volume_title: title,
            description,
            stock,
            price,
            cover_image: req.file ? req.file.path : cover_image_url,
            volume_number,
        };
        const response = await Volume_1.default.create(payload);
        // console.log("Volume created : ", response);
        res.json({ message: 'Volume created successfully', volume_id, data: response });
    }
    catch (err) {
        next(err);
    }
});
volumeRouter.get("/get_random_volumes", async (req, res, next) => {
    try {
        const limit = req.body?.limit || 6;
        const randomVolumes = await Volume_1.default.aggregate([{ $sample: { size: limit } }]);
        res.json({
            message: "Random volumes fetched successfully",
            volumes: randomVolumes,
        });
        // console.log("Random volumes: ", randomVolumes);
    }
    catch (err) {
        next(err);
    }
});
volumeRouter.post("/get_volumes_by_manga", async (req, res, next) => {
    try {
        const manga_id = req.body.manga_id;
        const limit = req.body?.limit || 10;
        const volumes = await Volume_1.default.find({ manga_id: manga_id }, { volume_id: 1, volume_title: 1, cover_image: 1, price: 1, volume_number: 1 }).limit(limit).sort({ volume_number: -1 });
        res.json({
            volumes,
            message: "Successfully fetched volumes for the manga",
            success: 1,
        });
    }
    catch (err) {
        next(err);
    }
});
volumeRouter.post("/get_volume_details", async (req, res, next) => {
    try {
        const volume_id = req.body.volume_id;
        const volumeDetails = await Volume_1.default.findOne({ volume_id });
        res.json({
            message: "Volume details fetched successfully",
            data: volumeDetails
        });
    }
    catch (err) {
        next(err);
    }
});
volumeRouter.post("/update_volume_details", async (req, res, next) => {
    console.log("Request:", req.body);
    res.send("Still working on it");
});
// Error handling middleware (must be added after routes)
volumeRouter.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: err?.message || err,
        stack: err?.stack || undefined,
    });
});
exports.default = volumeRouter;
