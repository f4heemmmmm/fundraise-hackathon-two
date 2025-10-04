import { Request, Response } from 'express';
import meetingService from '../services/meetingService';

/**
 * Get all meetings with optional filters
 * GET /api/meetings
 * Query params: status, dateFrom, dateTo
 */
export const getMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, dateFrom, dateTo } = req.query;

    const filters: any = {};

    if (status && typeof status === 'string') {
      if (!['pending', 'processing', 'completed', 'failed'].includes(status)) {
        res.status(400).json({ 
          success: false,
          error: 'Invalid status. Must be one of: pending, processing, completed, failed' 
        });
        return;
      }
      filters.status = status;
    }

    if (dateFrom && typeof dateFrom === 'string') {
      filters.dateFrom = new Date(dateFrom);
    }

    if (dateTo && typeof dateTo === 'string') {
      filters.dateTo = new Date(dateTo);
    }

    const meetings = await meetingService.getMeetings(filters);

    res.json({
      success: true,
      data: meetings,
      count: meetings.length,
    });
  } catch (error: any) {
    console.error('Error in getMeetings:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch meetings',
    });
  }
};

/**
 * Get a single meeting by ID
 * GET /api/meetings/:id
 */
export const getMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ 
        success: false,
        error: 'Meeting ID is required' 
      });
      return;
    }

    const meeting = await meetingService.getMeetingById(id);

    res.json({
      success: true,
      data: meeting,
    });
  } catch (error: any) {
    console.error('Error in getMeeting:', error.message);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch meeting',
    });
  }
};

/**
 * Create a new meeting
 * POST /api/meetings
 * Body: { title, date, duration, transcriptUrl?, transcriptText?, notetakerId? }
 */
export const createMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, date, duration, transcriptUrl, transcriptText, notetakerId } = req.body;

    // Validation
    if (!title || !date || !duration) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: title, date, and duration are required',
      });
      return;
    }

    if (typeof duration !== 'number' || duration <= 0) {
      res.status(400).json({
        success: false,
        error: 'Duration must be a positive number',
      });
      return;
    }

    const meeting = await meetingService.createMeeting({
      title,
      date: new Date(date),
      duration,
      transcriptUrl,
      transcriptText,
      notetakerId,
    });

    res.status(201).json({
      success: true,
      data: meeting,
      message: 'Meeting created successfully',
    });
  } catch (error: any) {
    console.error('Error in createMeeting:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create meeting',
    });
  }
};

/**
 * Process a meeting (generate summary and action items)
 * POST /api/meetings/:id/process
 */
export const processMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ 
        success: false,
        error: 'Meeting ID is required' 
      });
      return;
    }

    const meeting = await meetingService.processMeeting(id);

    res.json({
      success: true,
      data: meeting,
      message: 'Meeting processed successfully',
    });
  } catch (error: any) {
    console.error('Error in processMeeting:', error.message);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
      return;
    }

    if (error.message.includes('No transcript available')) {
      res.status(400).json({
        success: false,
        error: 'Meeting has no transcript to process',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process meeting',
    });
  }
};

/**
 * Update a meeting
 * PATCH /api/meetings/:id
 * Body: { title?, date?, duration?, transcriptUrl?, transcriptText?, summary? }
 */
export const updateMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      res.status(400).json({ 
        success: false,
        error: 'Meeting ID is required' 
      });
      return;
    }

    // Validate updates
    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No updates provided',
      });
      return;
    }

    // Convert date if provided
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const meeting = await meetingService.updateMeeting(id, updates);

    res.json({
      success: true,
      data: meeting,
      message: 'Meeting updated successfully',
    });
  } catch (error: any) {
    console.error('Error in updateMeeting:', error.message);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update meeting',
    });
  }
};

/**
 * Delete a meeting
 * DELETE /api/meetings/:id
 */
export const deleteMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ 
        success: false,
        error: 'Meeting ID is required' 
      });
      return;
    }

    await meetingService.deleteMeeting(id);

    res.json({
      success: true,
      message: 'Meeting and associated action items deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in deleteMeeting:', error.message);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete meeting',
    });
  }
};

/**
 * Get meeting statistics
 * GET /api/meetings/stats
 */
export const getMeetingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await meetingService.getMeetingStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in getMeetingStats:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch meeting statistics',
    });
  }
};

