import mongoose, { Schema, Document } from 'mongoose';

export interface IActionItem extends Document {
  meetingId: mongoose.Types.ObjectId; // reference to Meeting
  text: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed';
  dueDate?: Date;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActionItemSchema: Schema = new Schema(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    assignee: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtering by status and priority
ActionItemSchema.index({ status: 1, priority: 1 });

// Compound index for querying by meeting and status
ActionItemSchema.index({ meetingId: 1, status: 1 });

// Index for due date queries
ActionItemSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model<IActionItem>('ActionItem', ActionItemSchema);

