import express, { Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import { validateUser } from "../middlewares/validator";
import AddressesRepo from "../repo/addressesRepo";

const addressesRouter = express.Router();

const sendRepoResponse = (res: Response, response: any) => {
	if (response.apiSuccess === 1) return res.status(200).json(response);
	if (response.apiSuccess === -1) return res.status(500).json(response);
	return res.status(400).json(response);
};

addressesRouter.post(
	"/get_addresses",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await AddressesRepo.getAddresses(user_id, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

addressesRouter.post(
	"/add_address",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await AddressesRepo.addAddress(user_id, req.body, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

addressesRouter.post(
	"/update_address",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await AddressesRepo.updateAddress(user_id, req.body, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

addressesRouter.post(
	"/remove_address",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await AddressesRepo.removeAddress(user_id, req.body, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

addressesRouter.post(
	"/clear_addresses",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await AddressesRepo.clearAddresses(user_id, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

addressesRouter.use((err: any, req: Request, res: Response, next: any) => {
	console.error(err);
	res.status(500).json({ apiSuccess: -1, message: err?.message || err });
});

export default addressesRouter;
