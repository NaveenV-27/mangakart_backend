import { Schema, model, Document } from "mongoose";

interface CartItem {
  volume_id: string;
  manga_title: string;
  volume_title: string;
  type: "volume" | "chapter";
  cover_image: string;
  price: number;
  quantity: number;
}

interface Cart extends Document {
  user_id: string;
  items: CartItem[];
}

const CartSchema = new Schema<Cart>(
  {
    user_id: { type: String, required: true, unique: true },

    items: [
      {
        volume_id: { type: String, required: true },
        manga_title: { type: String, required: true },
        volume_title: { type: String, required: true },
        type: { type: String, enum: ["volume", "chapter"], required: true },

        cover_image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
      }
    ]
  },
  { timestamps: true }
);

export default model<Cart>("Cart", CartSchema);
