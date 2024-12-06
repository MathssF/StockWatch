import mongoose, { Schema, Document } from 'mongoose';

export interface IStock extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  stockDetails: mongoose.Types.ObjectId[];
}

const stockSchema = new Schema<IStock>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  stockDetails: [{ type: Schema.Types.ObjectId, ref: 'StockDetail' }]
});

export const Stock = mongoose.model<IStock>('Stock', stockSchema);
