import express from 'express';
import cors from 'cors';
import connectMongo from './config/mongoConfig';
import mangaProfile from './api/mangaProfile';
import userProfile from './api/userProfile';
// import cloudinary from './config/cloudinary';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import volumeProfile from './api/volumeProfile';
import adminProfile from './api/adminProfile';

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.CORS_ORIGIN_PRODUCTION,

    credentials: true,
  }));
app.use(express.json());
app.use("/api/manga", mangaProfile);
app.use("/api/volumes", volumeProfile);
app.use("/api/users", userProfile);
app.use("/api/admin", adminProfile);

// Connect to databases
connectMongo();

// Test route
app.get('/', (req, res) => {
  res.send('Mangakart backend is running with Mongo, MySQL & Cloudinary!');
});
app.post('/get-response', (req, res) => {
  console.log(req.body);  
  res.json({ message: 'Mangakart API running on app.ts!' });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
