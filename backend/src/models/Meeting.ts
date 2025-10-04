import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  date: Date;
  duration: number; // in minutes
  transcriptUrl?: string;
  transcriptText?: string;
  summary?: string;
  actionItems: mongoose.Types.ObjectId[]; // references to ActionItem
  notetakerId?: string; // reference to Nylas notetaker session
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    transcriptUrl: {
      type: String,
      trim: true,
    },
    transcriptText: {
      type: String,
    },
    summary: {
      type: String,
    },
    actionItems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ActionItem',
      },
    ],
    notetakerId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying meetings by date and status
MeetingSchema.index({ date: -1, status: 1 });

// Text index for searching by title
MeetingSchema.index({ title: 'text' });

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);

