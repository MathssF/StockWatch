import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  stock: mongoose.Types.ObjectId[];
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: [{ type: Schema.Types.ObjectId, ref: 'Stock' }]
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
