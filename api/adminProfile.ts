import express, { response } from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import AdminProfileRepo from "../repo/adminRepo";
import { validateUser } from "../middlewares/validator";

const adminRouter = express.Router();

adminRouter.post("/create_admin_profile",
	asyncErrorHandler(async (req: Request, res: Response) => {
		const data = req.body;
		await AdminProfileRepo.createAdminProfile( res, data, (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
));

adminRouter.post("/check_username",
	asyncErrorHandler(async (req: Request, res: Response) => {
		const {username} = req.body;
		await AdminProfileRepo.checkUsername( username, (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
));

adminRouter.post("/admin_login",
	asyncErrorHandler(async (req: Request, res: Response) => {
		const data = req.body;
		await AdminProfileRepo.adminLogin( data, res, (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
));

adminRouter.post("/logout", async (req:Request, res:Response) => {
	try {
		res.clearCookie("ADMIN");
		res.clearCookie("ROLE");
		res.clearCookie("Name");
		console.log("Logged out successfully");
		res.send("Logged out successfully");
	} catch (error) {
		console.log("Error during logout", error);
	}
})

adminRouter.post("/get_admin_profile", validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const username = req.user.username;
		const admin_id = req.user.admin_id;
		await AdminProfileRepo.getAdminProfile( username, admin_id, (response: any) => {
			if (response.apiSuccess === 1) return res.status(200).json(response);
			if (response.apiSuccess === -1) return res.status(500).json(response);
			return res.status(400).json(response);
		});
	}
))

export default adminRouter;