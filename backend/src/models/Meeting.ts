import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeeting extends Document {
  title?: string;
  provider: 'zoom' | 'google_meet' | 'microsoft_teams' | 'other';
  externalMeetingId: string; // Zoom ID, Google/Outlook event ID, etc.
  meetingUrl?: string;
  startTime?: Date;
  endTime?: Date;
  nylasSessionId?: string; // Notetaker session identifier
  transcriptionText?: string;
  transcriptionSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: { type: String },
    provider: { type: String, enum: ['zoom', 'google_meet', 'microsoft_teams', 'other'], required: true },
    externalMeetingId: { type: String, required: true, index: true, unique: true },
    meetingUrl: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    nylasSessionId: { type: String },
    transcriptionText: { type: String },
    transcriptionSummary: { type: String }
  },
  { timestamps: true }
);

let Meeting: Model<IMeeting>;
try {
  Meeting = mongoose.model<IMeeting>('Meeting');
} catch {
  Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);
}

export default Meeting;