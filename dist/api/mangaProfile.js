"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Manga_1 = __importDefault(require("../MongoModels/Manga"));
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
const mangaRouter = express_1.default.Router();
// mangaRouter.post(
//   '/upload-image',
//   upload.single('image'),
//   (req: MulterRequest, res: Response, next: NextFunction) => {
//     try {
//       console.log('Received:', req.body);
//       if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//       }
//       res.json({
//         message: 'Image uploaded successfully',
//         imageUrl: req.file.path,
//         publicId: req.file.filename,
//       });
//     } catch (err) {
//       next(err);
//     }
//   }
// );
mangaRouter.post("/get_random_manga", async (req, res, next) => {
    const limit = req.body?.limit || 10;
    const manga = await Manga_1.default.aggregate([{ $sample: { size: limit } }]).sort({ title: -1 });
    // console.log("Manga fetched:", manga);
    res.send(manga);
});
mangaRouter.post("/find_manga_by_genre", async (req, res, next) => {
    try {
        const genre = req.body.genre;
        console.log("Manga fetched:", genre);
        const genreResults = await Manga_1.default.find({ genres: { $regex: new RegExp(`^${genre}$`, 'i') } });
        res.send(genreResults);
    }
    catch (err) {
        next(err);
    }
});
mangaRouter.post("/create_manga", upload.single('cover_image'), // match the input file field name from the form
async (req, res, next) => {
    try {
        console.log('Received:', req.body);
        const { title, description, authors, genres, rating, cover_image_url, } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        // Parse JSON stringified arrays safely
        let parsedAuthors = [];
        let parsedGenres = [];
        try {
            parsedAuthors = authors ? JSON.parse(authors) : [];
            parsedGenres = genres ? JSON.parse(genres) : [];
        }
        catch (e) {
            return res.status(400).json({ error: 'Invalid authors or genres format' });
        }
        // Generate manga_id
        const mm = title
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
        const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
        const manga_id = `MAN${mm}${randomDigits}`;
        const payload = {
            title,
            description,
            authors: parsedAuthors,
            genres: parsedGenres,
            rating: parseFloat(rating),
            manga_id,
            created_at: new Date(),
            // Use uploaded file path if file present else fallback to image URL
            cover_image: req.file ? req.file.path : cover_image_url,
        };
        console.log('Payload:', payload);
        const response = await Manga_1.default.create(payload);
        res.json({ message: 'Manga created successfully', manga_id, data: response });
    }
    catch (err) {
        next(err);
    }
});
mangaRouter.post("/get_single_manga", async (req, res, next) => {
    try {
        console.log(req.body);
        const manga = req.body.manga;
        const mangaResult = await Manga_1.default.findOne({ title: manga });
        console.log(`Fetched results for ${manga}:`, mangaResult);
        res.send(mangaResult);
    }
    catch (err) {
        next(err);
    }
});
mangaRouter.post("/search_manga", async (req, res, next) => {
    try {
        console.log("Request: ", req.body);
        const searchTerm = req.body.search;
        const limit = req.body.limit || 10;
        const offset = req.body.offset || 0;
        const results = await Manga_1.default.find({
            title: { $regex: searchTerm, $options: "i" }
        }).skip(offset * 10).limit(limit);
        console.log("Search results: ", results);
        res.json({
            message: "Search results obtained successfully",
            results: results
        });
    }
    catch (err) {
        next(err);
    }
});
// Error handling middleware (must be added after routes)
mangaRouter.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: err?.message || err,
        stack: err?.stack || undefined,
    });
});
exports.default = mangaRouter;
