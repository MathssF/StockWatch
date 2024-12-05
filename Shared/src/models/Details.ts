import mongoose, { Schema, Document } from 'mongoose';

export interface IDetail extends Document {
  typeId: mongoose.Types.ObjectId;
  value: string;
}

const detailSchema = new Schema<IDetail>({
  typeId: { type: Schema.Types.ObjectId, ref: 'DetailType', required: true },
  value: { type: String, required: true }
});

export const Detail = mongoose.model<IDetail>('Detail', detailSchema);
