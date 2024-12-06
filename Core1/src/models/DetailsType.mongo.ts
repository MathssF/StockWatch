import mongoose, { Schema, Document } from 'mongoose';

export interface IDetailType extends Document {
  name: string;
}

const detailTypeSchema = new Schema<IDetailType>({
  name: { type: String, required: true }
});

export const DetailType = mongoose.model<IDetailType>('DetailType', detailTypeSchema);
