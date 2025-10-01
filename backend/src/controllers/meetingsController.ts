import { Request, Response } from 'express';
import Meeting from '../models/Meeting';
import { ensureNotetakerJoinsMeeting } from '../services/nylas';

export async function getTranscription(req: Request, res: Response) {
  try {
    const meeting = await Meeting.findById(req.params.id).lean();
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    return res.json({
      meetingId: meeting._id,
      title: meeting.title,
      provider: meeting.provider,
      transcriptionText: meeting.transcriptionText || null,
      transcriptionSummary: meeting.transcriptionSummary || null,
      updatedAt: meeting.updatedAt
    });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch transcription' });
  }
}

export async function upsertAndJoin(req: Request, res: Response) {
  try {
    const { externalMeetingId, provider, title, meetingUrl, startsAt } = req.body || {};
    if (!externalMeetingId || !provider || !meetingUrl) {
      return res.status(400).json({ message: 'externalMeetingId, provider, and meetingUrl are required' });
    }

    const joinRes = await ensureNotetakerJoinsMeeting({
      provider,
      meetingUrl,
      title,
      startsAt: startsAt ? new Date(startsAt) : undefined
    });

    const meeting = await Meeting.findOneAndUpdate(
      { externalMeetingId },
      {
        $set: {
          provider,
          title,
          meetingUrl,
          startTime: startsAt ? new Date(startsAt) : undefined,
          nylasSessionId: joinRes?.sessionId
        }
      },
      { new: true, upsert: true }
    );

    return res.json({ ok: true, meetingId: meeting._id, nylasSessionId: joinRes?.sessionId });
  } catch {
    return res.status(500).json({ message: 'Failed to upsert/join' });
  }
}

// Helper to extract a Zoom meeting ID from a Zoom link
function extractZoomMeetingId(zoomLink: string): string | null {
  try {
    // Common Zoom URL patterns include /j/<id> or /w/<id>; also handle raw 9-11 digit IDs
    const urlIdMatch = zoomLink.match(/[/]([jw])\/([0-9]{8,14})/i);
    if (urlIdMatch && urlIdMatch[2]) return urlIdMatch[2];
    const rawIdMatch = zoomLink.match(/([0-9]{8,14})/);
    if (rawIdMatch && rawIdMatch[1]) return rawIdMatch[1];
  } catch {
    // ignore
  }
  return null;
}

// GET /api/meetings → return list of meetings (titles only for now)
export async function listMeetings(req: Request, res: Response) {
  try {
    const meetings = await Meeting.find({}, { title: 1 }).sort({ createdAt: -1 }).lean();
    return res.json({ items: meetings.map(m => ({ id: m._id, title: m.title || '' })) });
  } catch {
    return res.status(500).json({ message: 'Failed to list meetings' });
  }
}

// POST /api/meetings → create meeting in MongoDB and register with Nylas Notetaker
export async function createMeeting(req: Request, res: Response) {
  try {
    const { title, zoomLink, datetime } = req.body || {};
    if (!title || !zoomLink || !datetime) {
      return res.status(400).json({ message: 'title, zoomLink, and datetime are required' });
    }

    const externalMeetingId = extractZoomMeetingId(zoomLink);
    if (!externalMeetingId) {
      return res.status(400).json({ message: 'Could not parse Zoom meeting ID from link' });
    }

    const startsAtDate = new Date(datetime);
    if (isNaN(startsAtDate.getTime())) {
      return res.status(400).json({ message: 'Invalid datetime' });
    }

    const joinRes = await ensureNotetakerJoinsMeeting({
      provider: 'zoom',
      meetingUrl: zoomLink,
      title,
      startsAt: startsAtDate
    });

    const meeting = await Meeting.findOneAndUpdate(
      { externalMeetingId },
      {
        $set: {
          provider: 'zoom',
          externalMeetingId,
          title,
          meetingUrl: zoomLink,
          startTime: startsAtDate,
          nylasSessionId: joinRes?.sessionId
        }
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      ok: true,
      meetingId: meeting._id,
      title: meeting.title,
      nylasSessionId: joinRes?.sessionId || null
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create meeting' });
  }
}
