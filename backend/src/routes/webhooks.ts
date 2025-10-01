import { Router } from 'express';
import { nylasWebhook } from '../controllers/webhooksController';

const router = Router();

router.post('/webhooks/nylas', nylasWebhook);

export default router;