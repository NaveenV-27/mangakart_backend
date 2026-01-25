import express from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import UserProfileRepo from "../repo/userRepo";
import { validateUser } from "../middlewares/validator";
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

const userRouter = express.Router();
userRouter.post("/user_profile", (req: Request, res: Response) => {
	console.log(req.body, req.cookies);
	try {
		const cookies = req.cookies?.user;
		console.log("Cookie:", cookies);
		const data = req.body;
		const secret = process.env.JWT_SECRET || "naveen";
		const isloggedIn = jwt.verify(cookies, secret);
		if (isloggedIn) {
			console.log("Already logged in", isloggedIn);
			res.send("Logged in already");
		} else {
			console.log("signing...");
			const token = jwt.sign(data, secret);
			console.log("Request:", token);
			res.cookie("user", token);
			res.json(token);
		}
	} catch (err: unknown) {
		console.error(err);
		res.send(err);
	}
});

// userRouter.post("upload_image", asyncErrorHandler(async (req: Request, res: Response)=> {
// 		upload.single("profile")
// 	}
// ))

// userRouter.post("/get_user_data", )
userRouter.post("/create_user_profile",
	asyncErrorHandler(async (req: Request, res: Response) => {
		const data = req.body;
		await UserProfileRepo.createUserProfile( res, data, (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
));

userRouter.post("/check_username",
	asyncErrorHandler(async (req: Request, res: Response) => {
		const {username} = req.body;
		await UserProfileRepo.checkUsername( username, (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
));

userRouter.post("/check_email",
	asyncErrorHandler(async (req: Request, res: Response) => {
		const {email} = req.body;
		await UserProfileRepo.checkEmail( email, (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
));

userRouter.post("/login",
	asyncErrorHandler(async (req: Request, res: Response) => {
		const data = req.body;
		await UserProfileRepo.userLogin( data, res,  (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
));

userRouter.post("/logout", async (req:Request, res:Response) => {
	try {
		res.clearCookie("USER");
		res.clearCookie("ROLE");
		res.clearCookie("Name");
		console.log("Logged out successfully");
		res.send("Logged out successfully");
	} catch (error) {
		console.log("Error during logout", error);
	}
})

userRouter.post("/get_user_profile", validateUser,
asyncErrorHandler(async (req: any, res: Response) => {
	const username = req.user.username;
	await UserProfileRepo.getUserProfile( username,  (response: any) => {
		if (response.apiSuccess === 1) return res.status(200).json(response);
		if (response.apiSuccess === -1) return res.status(500).json(response);
		return res.status(400).json(response);
	});
	}
));
export default userRouter;