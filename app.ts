import express from 'express';
import cors from 'cors';
import connectMongo from './config/mongoConfig';
import mangaProfile from './api/mangaProfile';
import userProfile from './api/userProfile';
import cartProfile from './api/cartProfile';
import addressesProfile from './api/addressesProfile';
// import cloudinary from './config/cloudinary';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import volumeProfile from './api/volumeProfile';
import adminProfile from './api/adminProfile';
import { validateUser } from './middlewares/validator';

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
app.use("/api/cart", cartProfile);
app.use("/api/addresses", addressesProfile);

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

const domain = process.env.DOMAIN || "localhost"
const PORT : number = (process.env.PORT || 4000) as number;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://${domain}:${PORT}`);
});
