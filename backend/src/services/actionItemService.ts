import ActionItem, { IActionItem } from '../models/ActionItem';
import Meeting from '../models/Meeting';
import mongoose from 'mongoose';

interface ActionItemFilters {
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'Completed';
  meetingId?: string;
  dueDateBefore?: Date;
  dueDateAfter?: Date;
}

interface CreateActionItemData {
  meetingId: string;
  text: string;
  priority: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'Completed';
  dueDate?: Date;
  assignee?: string;
}

class ActionItemService {
  /**
   * Create a single action item
   */
  async createActionItem(data: CreateActionItemData): Promise<IActionItem> {
    try {
      const actionItem = await ActionItem.create(data);
      console.log(`✅ Created action item: ${actionItem._id}`);
      return actionItem;
    } catch (error: any) {
      console.error('Error creating action item:', error.message);
      throw new Error(`Failed to create action item: ${error.message}`);
    }
  }

  /**
   * Bulk create action items (used by meeting processing)
   */
  async createActionItems(items: CreateActionItemData[]): Promise<IActionItem[]> {
    try {
      const actionItems = await ActionItem.insertMany(items);
      console.log(`✅ Created ${actionItems.length} action items`);
      return actionItems;
    } catch (error: any) {
      console.error('Error bulk creating action items:', error.message);
      throw new Error(`Failed to create action items: ${error.message}`);
    }
  }

  /**
   * Get all action items with optional filters
   */
  async getActionItems(filters: ActionItemFilters = {}): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.meetingId) {
        query.meetingId = filters.meetingId;
      }

      if (filters.dueDateBefore || filters.dueDateAfter) {
        query.dueDate = {};
        if (filters.dueDateBefore) {
          query.dueDate.$lte = filters.dueDateBefore;
        }
        if (filters.dueDateAfter) {
          query.dueDate.$gte = filters.dueDateAfter;
        }
      }

      // Priority order: High > Medium > Low
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };

      const actionItems = await ActionItem.find(query)
        .populate('meetingId', 'title date')
        .sort({ status: 1, createdAt: -1 })
        .lean();

      // Sort by priority manually (High first)
      const sorted = actionItems.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                            priorityOrder[b.priority as keyof typeof priorityOrder];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return sorted.map((item) => ({
        ...item,
        meetingTitle: (item.meetingId as any)?.title || 'Unknown Meeting',
        meetingDate: (item.meetingId as any)?.date,
      }));
    } catch (error: any) {
      console.error('Error fetching action items:', error.message);
      throw new Error(`Failed to fetch action items: ${error.message}`);
    }
  }

  /**
   * Get a single action item by ID
   */
  async getActionItemById(id: string): Promise<IActionItem | null> {
    try {
      const actionItem = await ActionItem.findById(id).populate('meetingId', 'title date');
      return actionItem;
    } catch (error: any) {
      console.error('Error fetching action item:', error.message);
      throw new Error(`Failed to fetch action item: ${error.message}`);
    }
  }

  /**
   * Get all action items for a specific meeting
   */
  async getActionItemsByMeeting(meetingId: string): Promise<IActionItem[]> {
    try {
      const actionItems = await ActionItem.find({ meetingId }).sort({ priority: 1, createdAt: -1 });
      return actionItems;
    } catch (error: any) {
      console.error('Error fetching action items by meeting:', error.message);
      throw new Error(`Failed to fetch action items: ${error.message}`);
    }
  }

  /**
   * Update an action item
   */
  async updateActionItem(
    id: string,
    updates: {
      status?: 'Pending' | 'Completed';
      priority?: 'High' | 'Medium' | 'Low';
      dueDate?: Date;
      assignee?: string;
      text?: string;
    }
  ): Promise<IActionItem | null> {
    try {
      const actionItem = await ActionItem.findByIdAndUpdate(id, updates, { new: true });

      if (!actionItem) {
        throw new Error('Action item not found');
      }

      console.log(`✅ Updated action item: ${id}`);
      return actionItem;
    } catch (error: any) {
      console.error('Error updating action item:', error.message);
      throw new Error(`Failed to update action item: ${error.message}`);
    }
  }

  /**
   * Delete an action item
   */
  async deleteActionItem(id: string): Promise<void> {
    try {
      const actionItem = await ActionItem.findByIdAndDelete(id);

      if (!actionItem) {
        throw new Error('Action item not found');
      }

      // Remove from meeting's actionItems array
      await Meeting.updateOne(
        { actionItems: id },
        { $pull: { actionItems: id } }
      );

      console.log(`✅ Deleted action item: ${id}`);
    } catch (error: any) {
      console.error('Error deleting action item:', error.message);
      throw new Error(`Failed to delete action item: ${error.message}`);
    }
  }

  /**
   * Get action item statistics
   */
  async getActionItemStats(meetingId?: string): Promise<any> {
    try {
      const match: any = {};
      if (meetingId) {
        match.meetingId = new mongoose.Types.ObjectId(meetingId);
      }

      const stats = await ActionItem.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
            },
            high: {
              $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] },
            },
            medium: {
              $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] },
            },
            low: {
              $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] },
            },
          },
        },
      ]);

      return stats[0] || {
        total: 0,
        pending: 0,
        completed: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
    } catch (error: any) {
      console.error('Error fetching action item stats:', error.message);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  }
}

export default new ActionItemService();

