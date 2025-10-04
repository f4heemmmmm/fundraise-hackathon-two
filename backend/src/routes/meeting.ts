import express from 'express';
import {
  getMeetings,
  getMeeting,
  createMeeting,
  processMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingStats,
} from '../controllers/meetingController';

const router = express.Router();

/**
 * Meeting management routes
 */

// Get statistics (must be before /:id to avoid route conflict)
router.get('/stats', getMeetingStats);

// Get all meetings with optional filters
router.get('/', getMeetings);

// Get single meeting by ID
router.get('/:id', getMeeting);

// Create new meeting
router.post('/', createMeeting);

// Process meeting (generate summary and action items)
router.post('/:id/process', processMeeting);

// Update meeting
router.patch('/:id', updateMeeting);

// Delete meeting
router.delete('/:id', deleteMeeting);

export default router;

