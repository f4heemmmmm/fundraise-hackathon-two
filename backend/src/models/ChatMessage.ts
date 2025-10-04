import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  meetingId: mongoose.Types.ObjectId; // reference to Meeting
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying chat history by meeting and time
ChatMessageSchema.index({ meetingId: 1, createdAt: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

