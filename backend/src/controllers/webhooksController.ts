import { Request, Response } from 'express';
import crypto from 'crypto';
import Meeting from '../models/Meeting';


// Handle Nylas webhook challenge verification
export async function nylasWebhookChallenge(req: Request, res: Response) {
  try {
    const challenge = req.query.challenge;
    if (!challenge) {
      console.error('No challenge parameter received');
      return res.status(400).send('No challenge parameter received');
    }

    console.log('Received webhook challenge:', challenge);
    
    // Return the challenge value exactly as received
    res.setHeader('Content-Type', 'text/plain');
    return res.send(challenge);
  } catch (error) {
    console.error('Error handling webhook challenge:', error);
    return res.status(500).send('Error handling challenge');
  }
}

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

    console.log('Received Nylas webhook:', { type, data });

    // Handle notetaker.media event which contains transcription
    if (type === 'notetaker.media') {
      console.log('Received media webhook data:', data);

      // Extract notetaker ID and other data
      const notetakerId: string | undefined = data.notetaker_id || data.object?.notetaker_id;
      const mediaType = data.object?.media_type || data.media_type;
      const meetingLink = data.object?.meeting_link || data.meeting_link;
      
      console.log('Processing notetaker.media webhook:', { notetakerId, mediaType, meetingLink, data });

      if (!notetakerId) {
        console.error('Missing notetaker ID in webhook:', data);
        return res.status(400).json({ message: 'Missing notetaker ID' });
      }

      // Get transcript data directly from the webhook
      const transcriptText = data.object?.text || data.text;
      const transcriptSummary = data.object?.summary || data.summary;
      
      // Try to find meeting by nylasSessionId first, then by externalMeetingId
      let meeting = await Meeting.findOne({ nylasSessionId: notetakerId });
      if (!meeting && meetingLink) {
        meeting = await Meeting.findOne({ meetingUrl: meetingLink });
      }

      if (meeting) {
        const update = {
          transcriptionText: transcriptText,
          transcriptionSummary: transcriptSummary,
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
