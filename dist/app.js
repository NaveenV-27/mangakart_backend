"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoConfig_1 = __importDefault(require("./config/mongoConfig"));
const mangaProfile_1 = __importDefault(require("./api/mangaProfile"));
const userProfile_1 = __importDefault(require("./api/userProfile"));
// import cloudinary from './config/cloudinary';
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const volumeProfile_1 = __importDefault(require("./api/volumeProfile"));
const adminProfile_1 = __importDefault(require("./api/adminProfile"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.CORS_ORIGIN_PRODUCTION,
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/manga", mangaProfile_1.default);
app.use("/api/volumes", volumeProfile_1.default);
app.use("/api/users", userProfile_1.default);
app.use("/api/admin", adminProfile_1.default);
// Connect to databases
(0, mongoConfig_1.default)();
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
