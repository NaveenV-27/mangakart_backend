import express from "express";
import { Router, Request, Response, NextFunction } from 'express';
import volumeProfile from "../MongoModels/Volume";
import { validateUser } from "../middlewares/validator";
// import multer from "multer";
// import cloudinary from '../config/cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure multer-storage-cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'uploads',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'avif'],
//   } as any,                   
// });

// const upload = multer({ storage: storage });

// interface MulterRequest extends Request {
//   file?: Express.Multer.File;
// }
const volumeRouter = express.Router();

volumeRouter.post(
  "/create_volume",
  validateUser,
  // upload.single('cover_image'), // match the input file field name from the form
  async (req: any, res: Response, next: NextFunction) => {
    try {
      console.log("Request recieved:", req.body);
      const {
        title,
        price,
        description,
        cover_image_url,
        stock,
        manga_id,
        volume_number,
      } = req.body;

      const admin_id = req.user?.admin_id || "ADMIN001";
      
      const mm = title ? title
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('') :"";
      const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
      const volume_id = `VOL${mm}${randomDigits}`;

      const payload = {
        volume_id,
        manga_id,
        volume_title : title,
        description,
        stock,
        price,
        cover_image : req.file ? req.file.path : cover_image_url,
        volume_number,
        created_by: admin_id
      };
      const response = await volumeProfile.create(payload);
      // console.log("Volume created : ", response);
      res.json({ message: 'Volume created successfully', volume_id, data: response });
    } catch (err) {
      next(err);
    }
})

volumeRouter.get("/get_random_volumes", async (req : Request, res : Response, next: NextFunction) => {
  try {
    const limit = req.body?.limit || 6;
    const randomVolumes = await volumeProfile.aggregate([{ $sample: { size: limit } }]);
    res.json({
      message: "Random volumes fetched successfully",
      volumes: randomVolumes,
    })
    // console.log("Random volumes: ", randomVolumes);
  } catch (err) {
    next(err);
  }
})

volumeRouter.post("/get_volumes_by_manga", async (req : Request, res : Response, next: NextFunction) => {
  try {
    const manga_id = req.body.manga_id;
    const limit = req.body?.limit || 10;
    const volumes = await volumeProfile.find({manga_id : manga_id}, {volume_id: 1, volume_title: 1, cover_image: 1, price: 1, volume_number: 1}).limit(limit).sort({volume_number : -1});
    res.json({
      volumes,
      message: "Successfully fetched volumes for the manga",
      success: 1,
    })
  } catch (err) {
    next(err);
  }
})

volumeRouter.post("/get_volume_details", async (req : Request, res : Response, next: NextFunction) => {
  try {
    const volume_id = req.body.volume_id;
    const volumeDetails = await volumeProfile.findOne({volume_id});
    res.json({
      message : "Volume details fetched successfully",
      data : volumeDetails
    })
  } catch (err) {
    next(err);
  }
})

volumeRouter.post("/update_volume_details", async(req : Request, res : Response, next: NextFunction) => {
  console.log("Request:", req.body);
  res.send("Still working on it");
})


// Error handling middleware (must be added after routes)
volumeRouter.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({
      error: err?.message || err,
      stack: err?.stack || undefined,
    });
  }
);
export default volumeRouter;