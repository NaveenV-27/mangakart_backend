import { Schema, model, Document } from "mongoose";

export interface UserAddressItem {
	address_id: string;
	full_name: string;
	phone_number: string;
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	pincode: string;
	country: string;
	address_type?: "home" | "work" | "other";
	is_default?: boolean;
}

export interface AddressesDoc extends Document {
	user_id: string;
	addresses: UserAddressItem[];
}

const AddressSchema = new Schema<UserAddressItem>(
	{
		address_id: { type: String, required: true },
		full_name: { type: String, required: true },
		phone_number: { type: String, required: true },
		address_line1: { type: String, required: true },
		address_line2: { type: String, default: "" },
		city: { type: String, required: true },
		state: { type: String, required: true },
		pincode: { type: String, required: true },
		country: { type: String, required: true },
		address_type: {
			type: String,
			enum: ["home", "work", "other"],
			default: "home",
		},
		is_default: { type: Boolean, default: false },
	},
	{ _id: false }
);

const AddressesSchema = new Schema<AddressesDoc>(
	{
		user_id: { type: String, required: true, unique: true },
		addresses: { type: [AddressSchema], default: [] },
	},
	{ timestamps: true }
);

export default model<AddressesDoc>("Addresses", AddressesSchema);
