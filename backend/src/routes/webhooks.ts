import { Router } from 'express';
import { nylasWebhook, nylasWebhookChallenge } from '../controllers/webhooksController';

const router = Router();

// GET endpoint for webhook challenge verification
router.get('/webhooks/nylas', nylasWebhookChallenge);

// POST endpoint for actual webhook events
router.post('/webhooks/nylas', nylasWebhook);

export default router;