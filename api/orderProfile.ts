import express, { Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import { validateUser } from "../middlewares/validator";
import ordersRepo from "../repo/ordersRepo";

const orderRouter = express.Router();

const sendRepoResponse = (res: Response, response: any) => {
  if (response.apiSuccess === 1) return res.status(200).json(response);
  if (response.apiSuccess === -1) return res.status(500).json(response);
  return res.status(400).json(response);
};

orderRouter.post("/create_order",
	// validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const data = req.body;
		await ordersRepo.placeOrder(data, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);
orderRouter.post("/get_orders",
	// validateUser,
	asyncErrorHandler(async (req: any, res: Response) => {
		const user_id = req.body.username;
		await ordersRepo.getOrders(user_id, (response: any) => {
			return sendRepoResponse(res, response);
		});
	})
);


export default orderRouter;
