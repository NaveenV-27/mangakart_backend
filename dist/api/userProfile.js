"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncErrorHandler_1 = require("../middlewares/asyncErrorHandler");
const userRepo_1 = __importDefault(require("../repo/userRepo"));
// import multer from "multer";
// import cloudinary from '../config/cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// const storage = new CloudinaryStorage({
// 	cloudinary: cloudinary,
// 	params: {
// 		folder: 'uploads',
// 		allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'avif'],
// 	} as any,                   
// });
// const upload = multer({ storage: storage });
const userRouter = express_1.default.Router();
userRouter.post("/user_profile", (req, res) => {
    console.log(req.body, req.cookies);
    try {
        const cookies = req.cookies?.user;
        console.log("Cookie:", cookies);
        const data = req.body;
        const secret = process.env.JWT_SECRET || "naveen";
        const isloggedIn = jsonwebtoken_1.default.verify(cookies, secret);
        if (isloggedIn) {
            console.log("Already logged in", isloggedIn);
            res.send("Logged in already");
        }
        else {
            console.log("signing...");
            const token = jsonwebtoken_1.default.sign(data, secret);
            console.log("Request:", token);
            res.cookie("user", token);
            res.json(token);
        }
    }
    catch (err) {
        console.error(err);
        res.send(err);
    }
});
// userRouter.post("upload_image", asyncErrorHandler(async (req: Request, res: Response)=> {
// 		upload.single("profile")
// 	}
// ))
// userRouter.post("/get_user_data", )
userRouter.post("/create_user_profile", (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
    const data = req.body;
    await userRepo_1.default.createUserProfile(res, data, (response) => {
        if (response.apiSuccess === 1)
            return res.status(200).json(response);
        if (response.apiSuccess === -1)
            return res.status(500).json(response);
        return res.status(400).json(response);
    });
}));
userRouter.post("/check_username", (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
    const { username } = req.body;
    await userRepo_1.default.checkUsername(username, (response) => {
        if (response.apiSuccess === 1)
            return res.status(200).json(response);
        if (response.apiSuccess === -1)
            return res.status(500).json(response);
        return res.status(400).json(response);
    });
}));
userRouter.post("/check_email", (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
    const { email } = req.body;
    await userRepo_1.default.checkEmail(email, (response) => {
        if (response.apiSuccess === 1)
            return res.status(200).json(response);
        if (response.apiSuccess === -1)
            return res.status(500).json(response);
        return res.status(400).json(response);
    });
}));
userRouter.post("/login", (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
    const data = req.body;
    console.log("IP:", req.ip);
    await userRepo_1.default.userLogin(data, res, (response) => {
        if (response.apiSuccess === 1)
            return res.status(200).json(response);
        if (response.apiSuccess === -1)
            return res.status(500).json(response);
        return res.status(400).json(response);
    });
}));
exports.default = userRouter;
