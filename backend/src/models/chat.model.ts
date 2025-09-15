import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  name?: string;
  isGroupChat: boolean;
  participants: mongoose.Types.ObjectId[];
  admins?: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50
    },
    isGroupChat: {
      type: Boolean,
      default: false
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index to improve query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ createdBy: 1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);