import express from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import AdminProfileRepo from "../repo/adminRepo";

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


export default adminRouter;