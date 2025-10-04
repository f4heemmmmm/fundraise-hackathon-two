import { Request, Response } from "express"
import actionItemService from "../services/actionItemService"

/**
 * Get all action items with optional filters
 * GET /api/action-items
 */
export const getActionItems = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { priority, status, meetingId, dueDateBefore, dueDateAfter } =
			req.query

		const filters: any = {}

		if (priority) {
			filters.priority = priority as string
		}

		if (status) {
			filters.status = status as string
		}

		if (meetingId) {
			filters.meetingId = meetingId as string
		}

		if (dueDateBefore) {
			filters.dueDateBefore = new Date(dueDateBefore as string)
		}

		if (dueDateAfter) {
			filters.dueDateAfter = new Date(dueDateAfter as string)
		}

		const actionItems = await actionItemService.getActionItems(filters)

		res.json({
			success: true,
			data: actionItems,
			count: actionItems.length,
		})
	} catch (error: any) {
		console.error("Error fetching action items:", error)
		res.status(500).json({
			success: false,
			error: error.message || "Failed to fetch action items",
		})
	}
}

/**
 * Get a single action item by ID
 * GET /api/action-items/:id
 */
export const getActionItem = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params

		const actionItem = await actionItemService.getActionItemById(id as string)

		if (!actionItem) {
			res.status(404).json({
				success: false,
				error: "Action item not found",
			})
			return
		}

		res.json({
			success: true,
			data: actionItem,
		})
	} catch (error: any) {
		console.error("Error fetching action item:", error)
		res.status(500).json({
			success: false,
			error: error.message || "Failed to fetch action item",
		})
	}
}

/**
 * Get all action items for a specific meeting
 * GET /api/action-items/meeting/:meetingId
 */
export const getActionItemsByMeeting = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { meetingId } = req.params

		const actionItems = await actionItemService.getActionItemsByMeeting(
			meetingId as string
		)

		res.json({
			success: true,
			data: actionItems,
			count: actionItems.length,
		})
	} catch (error: any) {
		console.error("Error fetching action items by meeting:", error)
		res.status(500).json({
			success: false,
			error: error.message || "Failed to fetch action items",
		})
	}
}

/**
 * Create a new action item
 * POST /api/action-items
 */
export const createActionItem = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { meetingId, text, priority, status, dueDate, assignee } = req.body

		// Validate required fields
		if (!meetingId || !text || !priority) {
			res.status(400).json({
				success: false,
				error:
					"Missing required fields: meetingId, text, and priority are required",
			})
			return
		}

		// Validate priority
		if (!["High", "Medium", "Low"].includes(priority)) {
			res.status(400).json({
				success: false,
				error: "Invalid priority. Must be High, Medium, or Low",
			})
			return
		}

		// Validate status if provided
		if (status && !["Pending", "Completed"].includes(status)) {
			res.status(400).json({
				success: false,
				error: "Invalid status. Must be Pending or Completed",
			})
			return
		}

		const actionItemData: any = {
			meetingId,
			text,
			priority,
			status: status || "Pending",
		}

		if (dueDate) {
			actionItemData.dueDate = new Date(dueDate)
		}

		if (assignee) {
			actionItemData.assignee = assignee
		}

		const actionItem = await actionItemService.createActionItem(actionItemData)

		res.status(201).json({
			success: true,
			data: actionItem,
			message: "Action item created successfully",
		})
	} catch (error: any) {
		console.error("Error creating action item:", error)
		res.status(500).json({
			success: false,
			error: error.message || "Failed to create action item",
		})
	}
}

/**
 * Update an action item
 * PATCH /api/action-items/:id
 */
export const updateActionItem = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params
		const { status, priority, dueDate, assignee, text } = req.body

		// Check if any updates are provided
		if (!status && !priority && !dueDate && !assignee && !text) {
			res.status(400).json({
				success: false,
				error: "No updates provided",
			})
			return
		}

		const updates: any = {}

		if (status) {
			if (!["Pending", "Completed"].includes(status)) {
				res.status(400).json({
					success: false,
					error: "Invalid status. Must be Pending or Completed",
				})
				return
			}
			updates.status = status
		}

		if (priority) {
			if (!["High", "Medium", "Low"].includes(priority)) {
				res.status(400).json({
					success: false,
					error: "Invalid priority. Must be High, Medium, or Low",
				})
				return
			}
			updates.priority = priority
		}

		if (dueDate) {
			updates.dueDate = new Date(dueDate)
		}

		if (assignee !== undefined) {
			updates.assignee = assignee
		}

		if (text) {
			updates.text = text
		}

		const actionItem = await actionItemService.updateActionItem(
			id as string,
			updates
		)

		if (!actionItem) {
			res.status(404).json({
				success: false,
				error: "Action item not found",
			})
			return
		}

		res.json({
			success: true,
			data: actionItem,
			message: "Action item updated successfully",
		})
	} catch (error: any) {
		console.error("Error updating action item:", error)
		res.status(500).json({
			success: false,
			error: error.message || "Failed to update action item",
		})
	}
}

/**
 * Delete an action item
 * DELETE /api/action-items/:id
 */
export const deleteActionItem = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params

		await actionItemService.deleteActionItem(id as string)

		res.json({
			success: true,
			message: "Action item deleted successfully",
		})
	} catch (error: any) {
		console.error("Error deleting action item:", error)

		if (error.message.includes("not found")) {
			res.status(404).json({
				success: false,
				error: "Action item not found",
			})
			return
		}

		res.status(500).json({
			success: false,
			error: error.message || "Failed to delete action item",
		})
	}
}

/**
 * Get action item statistics
 * GET /api/action-items/stats
 */
export const getActionItemStats = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { meetingId } = req.query

		const stats = await actionItemService.getActionItemStats(
			meetingId ? (meetingId as string) : undefined
		)

		res.json({
			success: true,
			data: stats,
		})
	} catch (error: any) {
		console.error("Error fetching action item stats:", error)
		res.status(500).json({
			success: false,
			error: error.message || "Failed to fetch statistics",
		})
	}
}
