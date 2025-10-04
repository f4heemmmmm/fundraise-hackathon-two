import Meeting, { IMeeting } from '../models/Meeting';
import ActionItem from '../models/ActionItem';
import openaiService, { ExtractedActionItem } from './openaiService';
import nylasService from './nylasService';
import actionItemService from './actionItemService';

interface CreateMeetingData {
  title: string;
  date: Date;
  duration: number;
  transcriptUrl?: string;
  transcriptText?: string;
  notetakerId?: string;
}

interface MeetingFilters {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  dateFrom?: Date;
  dateTo?: Date;
}

class MeetingService {
  /**
   * Create a new meeting
   */
  async createMeeting(data: CreateMeetingData): Promise<IMeeting> {
    try {
      const meeting = await Meeting.create({
        ...data,
        status: 'pending',
        actionItems: [],
      });

      console.log(`✅ Created meeting: ${meeting._id}`);
      return meeting;
    } catch (error: any) {
      console.error('Error creating meeting:', error.message);
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }

  /**
   * Get all meetings with optional filters
   */
  async getMeetings(filters: MeetingFilters = {}): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom) {
          query.date.$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          query.date.$lte = filters.dateTo;
        }
      }

      const meetings = await Meeting.find(query)
        .sort({ date: -1 })
        .lean();

      // Add action item count to each meeting
      const meetingsWithCounts = await Promise.all(
        meetings.map(async (meeting) => {
          const actionItemCount = await ActionItem.countDocuments({
            meetingId: meeting._id,
          });

          return {
            ...meeting,
            actionItemCount,
          };
        })
      );

      return meetingsWithCounts;
    } catch (error: any) {
      console.error('Error fetching meetings:', error.message);
      throw new Error(`Failed to fetch meetings: ${error.message}`);
    }
  }

  /**
   * Get a single meeting by ID with populated action items
   */
  async getMeetingById(id: string): Promise<any> {
    try {
      const meeting = await Meeting.findById(id)
        .populate('actionItems')
        .lean();

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      return meeting;
    } catch (error: any) {
      console.error('Error fetching meeting:', error.message);
      throw new Error(`Failed to fetch meeting: ${error.message}`);
    }
  }

  /**
   * Process a meeting: download transcript, generate summary, extract action items
   * This is the main orchestration method
   */
  async processMeeting(id: string): Promise<IMeeting> {
    try {
      console.log(`🚀 Starting processing for meeting: ${id}`);

      // 1. Fetch meeting
      const meeting = await Meeting.findById(id);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // 2. Set status to processing
      meeting.status = 'processing';
      await meeting.save();

      // 3. Get transcript text
      let transcriptText = meeting.transcriptText;

      if (!transcriptText && meeting.transcriptUrl) {
        console.log('📥 Downloading transcript from URL...');
        transcriptText = await nylasService.downloadTextFile(meeting.transcriptUrl);
        meeting.transcriptText = transcriptText;
        await meeting.save();
      }

      if (!transcriptText) {
        throw new Error('No transcript available for processing');
      }

      console.log(`📝 Transcript length: ${transcriptText.length} characters`);

      // 4. Generate summary with AI
      const summary = await openaiService.summarizeMeeting(transcriptText);
      meeting.summary = summary;
      await meeting.save();

      // 5. Extract action items with AI
      const extractedItems: ExtractedActionItem[] = await openaiService.extractActionItems(transcriptText);

      // 6. Create action item documents
      if (extractedItems.length > 0) {
        const actionItemsData = extractedItems.map((item) => ({
          meetingId: meeting._id.toString(),
          text: item.text,
          priority: item.priority,
          status: 'Pending' as const,
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
          assignee: item.assignee,
        }));

        const createdActionItems = await actionItemService.createActionItems(actionItemsData);

        // 7. Link action items to meeting
        meeting.actionItems = createdActionItems.map((item) => item._id);
      }

      // 8. Set status to completed
      meeting.status = 'completed';
      await meeting.save();

      console.log(`✅ Meeting processing completed: ${id}`);
      console.log(`   - Summary: ${summary.length} characters`);
      console.log(`   - Action items: ${extractedItems.length}`);

      // Return populated meeting
      return await Meeting.findById(id).populate('actionItems') as IMeeting;
    } catch (error: any) {
      console.error('Error processing meeting:', error.message);

      // Set status to failed
      await Meeting.findByIdAndUpdate(id, {
        status: 'failed',
      });

      throw new Error(`Failed to process meeting: ${error.message}`);
    }
  }

  /**
   * Update a meeting
   */
  async updateMeeting(
    id: string,
    updates: {
      title?: string;
      date?: Date;
      duration?: number;
      transcriptUrl?: string;
      transcriptText?: string;
      summary?: string;
    }
  ): Promise<IMeeting | null> {
    try {
      const meeting = await Meeting.findByIdAndUpdate(id, updates, { new: true });

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      console.log(`✅ Updated meeting: ${id}`);
      return meeting;
    } catch (error: any) {
      console.error('Error updating meeting:', error.message);
      throw new Error(`Failed to update meeting: ${error.message}`);
    }
  }

  /**
   * Delete a meeting and its action items
   */
  async deleteMeeting(id: string): Promise<void> {
    try {
      const meeting = await Meeting.findById(id);

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Delete all associated action items
      await ActionItem.deleteMany({ meetingId: id });

      // Delete meeting
      await Meeting.findByIdAndDelete(id);

      console.log(`✅ Deleted meeting and action items: ${id}`);
    } catch (error: any) {
      console.error('Error deleting meeting:', error.message);
      throw new Error(`Failed to delete meeting: ${error.message}`);
    }
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStats(): Promise<any> {
    try {
      const total = await Meeting.countDocuments();
      const pending = await Meeting.countDocuments({ status: 'pending' });
      const processing = await Meeting.countDocuments({ status: 'processing' });
      const completed = await Meeting.countDocuments({ status: 'completed' });
      const failed = await Meeting.countDocuments({ status: 'failed' });

      return {
        total,
        pending,
        processing,
        completed,
        failed,
      };
    } catch (error: any) {
      console.error('Error fetching meeting stats:', error.message);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  }
}

export default new MeetingService();

