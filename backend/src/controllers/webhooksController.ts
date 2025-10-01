import { Request, Response } from 'express';
import crypto from 'crypto';
import Meeting from '../models/Meeting';
import { fetchTranscriptionBySession } from '../services/nylas';

function verifyNylasSignature(req: Request): boolean {
  const secret = process.env.NYLAS_WEBHOOK_SECRET || '';
  if (!secret) return true; // skip if not set
  const signature = req.headers['x-nylas-signature'] as string | undefined;
  if (!signature) return false;
  const payload = JSON.stringify(req.body || {});
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
}

export async function nylasWebhook(req: Request, res: Response) {
  try {
    if (!verifyNylasSignature(req)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { type, data } = req.body || {};
    if (!type || !data) return res.status(400).json({ message: 'Invalid payload' });

    if (type === 'notetaker.transcription.completed') {
      // Extract notetaker ID from the webhook data
      const notetakerId: string | undefined = data.object?.id || data.notetaker_id || data.id;
      const externalMeetingId: string | undefined = data.object?.meeting_link || data.meeting_link;
      const provider = (data.object?.meeting_provider || data.meeting_provider || 'other') as 'zoom' | 'google_meet' | 'microsoft_teams' | 'other';

      if (!notetakerId) {
        console.error('Missing notetaker ID in webhook:', data);
        return res.status(400).json({ message: 'Missing notetaker ID' });
      }

      // Fetch transcription using the notetaker ID
      const transcript = await fetchTranscriptionBySession(notetakerId);
      
      // Try to find meeting by nylasSessionId first, then by externalMeetingId
      let meeting = await Meeting.findOne({ nylasSessionId: notetakerId });
      if (!meeting && externalMeetingId) {
        meeting = await Meeting.findOne({ externalMeetingId });
      }

      if (meeting) {
        const update = {
          transcriptionText: transcript.text,
          transcriptionSummary: transcript.summary,
          nylasSessionId: notetakerId
        };

        await Meeting.findByIdAndUpdate(meeting._id, { $set: update });
        console.log(`Updated transcription for meeting ${meeting._id}`);
      } else {
        console.warn(`No meeting found for notetaker ID ${notetakerId}`);
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Webhook handling failed' });
  }
}
