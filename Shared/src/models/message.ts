import mongoose, { Document, Schema } from 'mongoose';

interface IMessage extends Document {
  content: string;
}

const messageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

export { Message };
