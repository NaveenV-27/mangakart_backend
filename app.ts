import express from 'express';
import cors from 'cors';
import connectMongo from './config/mongoConfig';
import connectMySQL from './config/mysqlConfig';
import mangaProfile from './api/mangaProfile';
import userProfile from './api/userProfile';
// import cloudinary from './config/cloudinary';
import cookieParser from "cookie-parser";
import { validateUser } from './middlewares/validator';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use("/api/manga", mangaProfile);
app.use("/api/users", validateUser, userProfile);

// Connect to databases
connectMongo();
connectMySQL();

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
  console.log(`Server is running on port ${PORT}`);
});
