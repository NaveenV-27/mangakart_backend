import AddressesModel, {
	UserAddressItem,
} from "../MongoModels/Addresses";

export type AddressInput = Omit<UserAddressItem, "address_id"> & {
	address_id?: string;
};

type RepoResponse = {
	apiSuccess: 1 | 0 | -1;
	message: string;
	data?: any;
};

const requiredKeys: Array<keyof Omit<UserAddressItem, "address_id">> = [
	"full_name",
	"phone_number",
	"address_line1",
	"city",
	"state",
	"pincode",
	"country",
];

const makeAddressId = () => {
	const rand = Math.floor(10000 + Math.random() * 90000);
	return `ADDR${rand}`;
};

const assertRequired = (address: any): RepoResponse | null => {
	for (const key of requiredKeys) {
		if (address?.[key] === undefined || address?.[key] === null || address?.[key] === "") {
			return { apiSuccess: 0, message: `${String(key)} is required` };
		}
	}
	return null;
};

class AddressesRepo {
	static async getAddresses(user_id: string, callback: (response: RepoResponse) => void) {
		try {
			const doc = await AddressesModel.findOne({ user_id });
			if (doc)
				return callback({ apiSuccess: 1, message: "Addresses fetched successfully", data: doc });
			const created = await AddressesModel.create({ user_id, addresses: [] });
			return callback({ apiSuccess: 1, message: "Addresses created successfully", data: created });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async addAddress(
		user_id: string,
		address: AddressInput,
		callback: (response: RepoResponse) => void
	) {
		try {
			const missing = assertRequired(address);
			if (missing) return callback(missing);

			const doc = await AddressesModel.findOne({ user_id });
			const base = doc || (await AddressesModel.create({ user_id, addresses: [] }));

			const address_id = address.address_id || makeAddressId();
			const shouldDefault = base.addresses.length === 0;
			const is_default = Boolean(address.is_default ?? shouldDefault);

			if (is_default) {
				base.addresses = base.addresses.map((a: any) => ({
					...(a.toObject?.() ?? a),
					is_default: false,
				})) as any;
			}

			base.addresses.push({
				...(address as any),
				address_id,
				is_default,
			});
			await base.save();
			return callback({ apiSuccess: 1, message: "Address added successfully", data: base });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async updateAddress(
		user_id: string,
		payload: { address_id?: string } & Partial<UserAddressItem>,
		callback: (response: RepoResponse) => void
	) {
		try {
			const { address_id, ...updates } = payload || {};
			if (!address_id) return callback({ apiSuccess: 0, message: "address_id is required" });

			const doc = await AddressesModel.findOne({ user_id });
			const base = doc || (await AddressesModel.create({ user_id, addresses: [] }));
			const idx = base.addresses.findIndex((a: any) => a.address_id === address_id);
			if (idx === -1)
				return callback({ apiSuccess: 1, message: "Address updated successfully", data: base });

			const current = (base.addresses[idx] as any).toObject?.() ?? base.addresses[idx];
			const next = { ...current, ...(updates as any), address_id };

			if (updates.is_default === true) {
				base.addresses = base.addresses.map((a: any) => ({
					...(a.toObject?.() ?? a),
					is_default: a.address_id === address_id,
				})) as any;
				base.addresses[idx] = next as any;
			} else {
				base.addresses[idx] = next as any;
			}

			await base.save();
			return callback({ apiSuccess: 1, message: "Address updated successfully", data: base });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async removeAddress(
		user_id: string,
		payload: { address_id?: string },
		callback: (response: RepoResponse) => void
	) {
		try {
			const { address_id } = payload || {};
			if (!address_id) return callback({ apiSuccess: 0, message: "address_id is required" });

			const doc = await AddressesModel.findOne({ user_id });
			const base = doc || (await AddressesModel.create({ user_id, addresses: [] }));
			const removed = base.addresses.find((a: any) => a.address_id === address_id);
			base.addresses = base.addresses.filter((a: any) => a.address_id !== address_id) as any;

			if (removed?.is_default && base.addresses.length > 0) {
				(base.addresses[0] as any).is_default = true;
			}

			await base.save();
			return callback({ apiSuccess: 1, message: "Address removed successfully", data: base });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}

	static async clearAddresses(user_id: string, callback: (response: RepoResponse) => void) {
		try {
			const doc = await AddressesModel.findOne({ user_id });
			const base = doc || (await AddressesModel.create({ user_id, addresses: [] }));
			base.addresses = [] as any;
			await base.save();
			return callback({ apiSuccess: 1, message: "Addresses cleared successfully", data: base });
		} catch (error: any) {
			return callback({ apiSuccess: -1, message: error.message });
		}
	}
}

export default AddressesRepo;
