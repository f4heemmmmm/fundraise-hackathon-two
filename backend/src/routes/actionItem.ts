import express from 'express';
import {
  getActionItems,
  getActionItem,
  getActionItemsByMeeting,
  createActionItem,
  updateActionItem,
  deleteActionItem,
  getActionItemStats,
} from '../controllers/actionItemController';

const router = express.Router();

/**
 * Action Item Routes
 */

// Get statistics (must be before /:id to avoid route conflict)
router.get('/stats', getActionItemStats);

// Get all action items (with optional filters)
router.get('/', getActionItems);

// Get action items by meeting ID
router.get('/meeting/:meetingId', getActionItemsByMeeting);

// Get single action item by ID
router.get('/:id', getActionItem);

// Create new action item
router.post('/', createActionItem);

// Update action item
router.patch('/:id', updateActionItem);

// Delete action item
router.delete('/:id', deleteActionItem);

export default router;

