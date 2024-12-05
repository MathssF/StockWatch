import mongoose, { Schema, Document } from 'mongoose';

export interface IStockDetail extends Document {
  stockId: mongoose.Types.ObjectId;
  detailId: mongoose.Types.ObjectId;
}

const stockDetailSchema = new Schema<IStockDetail>({
  stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
  detailId: { type: Schema.Types.ObjectId, ref: 'Detail', required: true }
});

export const StockDetail = mongoose.model<IStockDetail>('StockDetail', stockDetailSchema);
