import express from "express";
import { Router, Request, Response, NextFunction } from 'express';
import MangaProfile from "../MongoModels/Manga";
import multer from "multer";
import cloudinary from '../config/cloudinary';
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
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'avif'],
  } as any,                   
});

const upload = multer({ storage: storage });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
const mangaRouter = express.Router();

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


mangaRouter.post("/manga_profile", async (req : Request, res : Response, next: NextFunction) => {
    const limit = req.body?.limit || 10;
    const manga = await MangaProfile.find({}).sort({title : -1}).limit(limit);
    // console.log("Manga fetched:", manga);
    res.send(manga);
});

mangaRouter.post("/find_manga_by_genre", async (req : Request, res : Response, next: NextFunction) => {
  try {
    const genre = req.body.genre;
    const genreResults = await MangaProfile.find({genres : genre});
    // console.log("Manga fetched:", genreResults);
    res.send(genreResults);
  } catch (err) {
    next(err);
  }
});

mangaRouter.post(
  "/create_manga",
  upload.single('cover_image'), // match the input file field name from the form
  async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      console.log('Received:', req.body);

      const {
        title,
        description,
        authors,
        genres,
        rating,
        cover_image_url,
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Parse JSON stringified arrays safely
      let parsedAuthors: string[] = [];
      let parsedGenres: string[] = [];
      try {
        parsedAuthors = authors ? JSON.parse(authors) : [];
        parsedGenres = genres ? JSON.parse(genres) : [];
      } catch (e) {
        return res.status(400).json({ error: 'Invalid authors or genres format' });
      }

      // Generate manga_id
      const mm = title
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('');
      const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
      const manga_id = `MAN${mm}${randomDigits}`;

      const payload: Manga = {
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

      const response = await MangaProfile.create(payload);

      res.json({ message: 'Manga created successfully', manga_id, data: response });
    } catch (err) {
      next(err);
    }
  }
);

mangaRouter.post("/get_single_manga", async (req : Request, res : Response, next: NextFunction) => {
  try{

    console.log(req.body);
    const manga = req.body.manga;
    const mangaResult = await MangaProfile.findOne({title : manga});
    console.log(`Fetched results for ${manga}:`, mangaResult);
    res.send(mangaResult);
  } catch (err) {
      next(err);
  }
})

mangaRouter.post("/search_manga", async (req : Request, res : Response, next: NextFunction) =>{
  try {
    console.log("Request: ", req.body);
    const searchTerm = req.body.search;
    const limit = req.body.limit || 10;
    const offset = req.body.offset || 0;
    const results = await MangaProfile.find({
      title: { $regex: searchTerm, $options: "i" }
    }).skip(offset * 10).limit(limit);
    console.log("Search results: ", results);
    res.json({
      message:"Search results obtained successfully",
      results: results
    })
  } catch (err) {
    next(err);
  }
})




// Error handling middleware (must be added after routes)
mangaRouter.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({
      error: err?.message || err,
      stack: err?.stack || undefined,
    });
  }
);
export default mangaRouter;