import CartModel from "../MongoModels/Cart";

export type CartItemInput = {
	volume_id: string;
	manga_title: string;
	volume_title: string;
	type: "volume" | "chapter";
	cover_image: string;
	price: number;
	quantity?: number;
};

type RepoResponse = {
	apiSuccess: 1 | 0 | -1;
	message: string;
	data?: any;
};

class CartRepo {
	static async getCart(user_id: string, callback: (response: RepoResponse) => void) {
		try {
			const cart = await CartModel.findOne({ user_id });
			if (cart)
				return callback({
					apiSuccess: 1,
					message: "Cart fetched successfully",
					data: cart,
				});
			const created = await CartModel.create({ user_id, items: [] });
			return callback({
				apiSuccess: 1,
				message: "Cart created successfully",
				data: created,
			});
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async addItem(
		user_id: string,
		item: CartItemInput,
		callback: (response: RepoResponse) => void
	) {
		try {
			const required = [
				"volume_id",
				"manga_title",
				"volume_title",
				"type",
				"cover_image",
				"price",
			];
			for (const key of required) {
				if ((item as any)?.[key] === undefined || (item as any)?.[key] === null || (item as any)?.[key] === "") {
					return callback({ apiSuccess: 0, message: `${key} is required` });
				}
			}
			if (item.type !== "volume" && item.type !== "chapter") {
				return callback({ apiSuccess: 0, message: "type must be 'volume' or 'chapter'" });
			}

			const qty = Math.max(1, Number(item.quantity ?? 1));

			const cart = await CartModel.findOne({ user_id });
			if (!cart) {
				const created = await CartModel.create({
					user_id,
					items: [{ ...item, quantity: qty }],
				});
				return callback({
					apiSuccess: 1,
					message: "Item added to cart",
					data: created,
				});
			}

			const existing = cart.items.find(
				(i: any) => i.volume_id === item.volume_id && i.type === item.type
			);
			if (existing) {
				existing.quantity = (existing.quantity ?? 1) + qty;
			} else {
				cart.items.push({ ...(item as any), quantity: qty });
			}
			await cart.save();
			return callback({ apiSuccess: 1, message: "Item added to cart", data: cart });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async updateQuantity(
		user_id: string,
		payload: { volume_id?: string; type?: "volume" | "chapter"; quantity?: number },
		callback: (response: RepoResponse) => void
	) {
		try {
			const { volume_id, type, quantity } = payload || {};
			if (!volume_id) return callback({ apiSuccess: 0, message: "volume_id is required" });
			if (type !== "volume" && type !== "chapter")
				return callback({ apiSuccess: 0, message: "type must be 'volume' or 'chapter'" });
			if (quantity === undefined || quantity === null || Number.isNaN(Number(quantity)))
				return callback({ apiSuccess: 0, message: "quantity must be a number" });

			const qty = Math.max(0, Number(quantity));
			const cart = await CartModel.findOne({ user_id });
			if (!cart) {
				const created = await CartModel.create({ user_id, items: [] });
				return callback({ apiSuccess: 1, message: "Cart updated", data: created });
			}

			const idx = cart.items.findIndex(
				(i: any) => i.volume_id === String(volume_id) && i.type === type
			);
			if (idx === -1) {
				return callback({ apiSuccess: 1, message: "Cart updated", data: cart });
			}

			if (qty === 0) {
				cart.items.splice(idx, 1);
			} else {
				(cart.items[idx] as any).quantity = qty;
			}
			await cart.save();
			return callback({ apiSuccess: 1, message: "Cart updated", data: cart });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async removeItem(
		user_id: string,
		payload: { volume_id?: string; type?: "volume" | "chapter" },
		callback: (response: RepoResponse) => void
	) {
		try {
			const { volume_id, type } = payload || {};
			if (!volume_id) return callback({ apiSuccess: 0, message: "volume_id is required" });
			if (type !== "volume" && type !== "chapter")
				return callback({ apiSuccess: 0, message: "type must be 'volume' or 'chapter'" });

			const cart = await CartModel.findOne({ user_id });
			if (!cart) {
				const created = await CartModel.create({ user_id, items: [] });
				return callback({ apiSuccess: 1, message: "Item removed from cart", data: created });
			}

			cart.items = cart.items.filter(
				(i: any) => !(i.volume_id === String(volume_id) && i.type === type)
			) as any;
			await cart.save();
			return callback({ apiSuccess: 1, message: "Item removed from cart", data: cart });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async clearCart(user_id: string, callback: (response: RepoResponse) => void) {
		try {
			const cart = await CartModel.findOne({ user_id });
			if (!cart) {
				const created = await CartModel.create({ user_id, items: [] });
				return callback({ apiSuccess: 1, message: "Cart cleared", data: created });
			}
			cart.items = [] as any;
			await cart.save();
			return callback({ apiSuccess: 1, message: "Cart cleared", data: cart });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}
}

export default CartRepo;
