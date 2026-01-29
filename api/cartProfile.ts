import express, { Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import { validateUser } from "../middlewares/validator";
import CartRepo from "../repo/cartRepo";

const cartRouter = express.Router();

const sendRepoResponse = (res: Response, response: any) => {
	if (response.apiSuccess === 1) return res.status(200).json(response);
	if (response.apiSuccess === -1) return res.status(500).json(response);
	return res.status(400).json(response);
};

cartRouter.post(
	"/get_cart",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await CartRepo.getCart(user_id, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

cartRouter.post(
	"/add_item",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await CartRepo.addItem(user_id, req.body, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

cartRouter.post(
	"/update_quantity",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await CartRepo.updateQuantity(user_id, req.body, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

cartRouter.post(
	"/remove_item",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await CartRepo.removeItem(user_id, req.body, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

cartRouter.post(
	"/clear_cart",
	validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.user.username;
		await CartRepo.clearCart(user_id, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);

// Basic error handler for this router
cartRouter.use((err: any, req: Request, res: Response, next: any) => {
	console.error(err);
	res.status(500).json({ apiSuccess: -1, message: err?.message || err });
});

export default cartRouter;
