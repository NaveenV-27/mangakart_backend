import express from "express";
import { Request, Response } from "express";
import MangaProfile from "../MongoModels/Manga";
import cloudinary from '../config/cloudinary';
import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary';

interface Manga {
    manga_id: string;
    title: string;
    description?: string;
    authors: string[];
    genres: string[];
    cover_image: string; // Cloudinary URL
    // gallery?: string[];
    // price: number;
    // stock: number;
    rating: number;
    created_at: Date;
}


// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  } as any,                   // Disable exact type checking here
});

const upload = multer({ storage: storage });

const mangaRouter = express.Router();
mangaRouter.post("/upload-image", upload.single('image'), (req, res) => {
    console.log("Recieved:", req.body);
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    // req.file.path contains the Cloudinary URL of uploaded image
    res.json({
        message: 'Image uploaded successfully',
        imageUrl: req.file.path,
        publicId: req.file.filename,
    });
});

mangaRouter.post("/manga_profile", (req : Request, res : Response) => {
    console.log("Request:", req.body);
    res.json(req.body);
});

mangaRouter.post("/create_manga", (req : Request, res : Response) => {
    // MangaProfile.create();
    try {
        const data = req.body;
        const name = req.body?.title;
        const mm = name
        .split(' ')
        .map((word:string) => word.charAt(0).toUpperCase())
        .join('');
    
    // Generate random 4-digit number as string
        const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();

        const manga_id =  `MAN${mm}${randomDigits}`;
        console.log("Body:", data, manga_id);
        const payload : Manga = {
            ...data,
            manga_id
        }
        console.log("Payload:", payload);
        const response = MangaProfile.create(payload)
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(400).send(err);
    }
});
export default mangaRouter;