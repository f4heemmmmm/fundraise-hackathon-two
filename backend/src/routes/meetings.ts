import { Router } from 'express';
import { getTranscription, upsertAndJoin, listMeetings, createMeeting } from '../controllers/meetingsController';

const router = Router();

router.get('/api/meetings/:id/transcription', getTranscription);
router.post('/api/meetings/upsert-and-join', upsertAndJoin);
router.get('/api/meetings', listMeetings);
router.post('/api/meetings', createMeeting);

export default router;