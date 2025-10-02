import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.NYLAS_API_KEY;
if (!apiKey) {
  console.warn('NYLAS_API_KEY is not set');
}

const NYLAS_API_BASE = 'https://api.us.nylas.com/v3';

// Join a meeting with Notetaker using real Nylas API
export async function ensureNotetakerJoinsMeeting(params: {
  provider: 'zoom' | 'google_meet' | 'microsoft_teams';
  meetingUrl: string;
  title?: string;
  startsAt?: Date;
}): Promise<{ sessionId: string } | null> {
  if (!apiKey) {
    console.warn('NYLAS_API_KEY not set, skipping Notetaker join');
    return null;
  }

  try {
    const requestBody = {
      meeting_link: params.meetingUrl,
      join_time: params.startsAt ? Math.floor(params.startsAt.getTime() / 1000) : undefined,
      display_name: "Notetaker Bot (Recording & Transcribing)",
      send_recording_consent_message: true
    };
    
    console.log('Sending Nylas request:', {
      url: `${NYLAS_API_BASE}/notetakers`,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: requestBody
    });

    const response = await fetch(`${NYLAS_API_BASE}/notetakers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to invite Notetaker:', {
        status: response.status,
        error: errorText,
        url: response.url,
        requestBody,
        headers: Object.fromEntries(response.headers.entries())
      });
      return null;
    }

    const data = await response.json();
    return { sessionId: data.id || data.notetaker_id };
  } catch (error) {
    console.error('Error inviting Notetaker:', error);
    return null;
  }
}

// Fetch transcription using real Nylas API
export async function fetchTranscriptionBySession(notetakerId: string): Promise<{ text?: string; summary?: string }> {
  if (!apiKey) {
    console.warn('NYLAS_API_KEY not set, cannot fetch transcription');
    return {};
  }

  try {
    const response = await fetch(`${NYLAS_API_BASE}/notetakers/${notetakerId}/transcription`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch transcription:', response.status, errorText);
      return {};
    }

    const data = await response.json();
    return {
      text: data.transcription_text || data.text,
      summary: data.summary
    };
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return {};
  }
}