import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectMongo from './config/mongoConfig';
import connectMySQL from './config/mysqlConfig';
import cloudinary from './config/cloudinary';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to databases
// connectMongo();
// connectMySQL();

// Test route
app.get('/', (req, res) => {
  res.send('Mangakart backend is running with Mongo, MySQL & Cloudinary!');
});
app.post('/get-response', (req, res) => {
  console.log(req.body);  
  res.json({ message: 'Mangakart API running on app.ts!' });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
