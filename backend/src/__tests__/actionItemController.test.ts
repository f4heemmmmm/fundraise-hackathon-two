import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { Request, Response } from "express"
import {
	getActionItems,
	getActionItem,
	getActionItemsByMeeting,
	createActionItem,
	updateActionItem,
	deleteActionItem,
	getActionItemStats,
} from "../controllers/actionItemController"
import actionItemService from "../services/actionItemService"

// Mock the action item service
jest.mock("../services/actionItemService")

describe("Action Item Controller", () => {
	let mockRequest: Partial<Request>
	let mockResponse: Partial<Response>
	let responseStatus: jest.MockedFunction<any>
	let responseJson: jest.MockedFunction<any>

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks()

		// Setup mock response
		responseStatus = jest.fn().mockReturnThis() as jest.MockedFunction<any>
		responseJson = jest.fn().mockReturnThis() as jest.MockedFunction<any>

		mockResponse = {
			status: responseStatus,
			json: responseJson,
		}

		mockRequest = {}
	})

	describe("getActionItems", () => {
		it("should get all action items without filters", async () => {
			const mockActionItems = [
				{
					_id: "1",
					text: "Action 1",
					priority: "High",
					status: "Pending",
				},
				{
					_id: "2",
					text: "Action 2",
					priority: "Medium",
					status: "Completed",
				},
			]

			const getActionItemsMock =
				actionItemService.getActionItems as jest.MockedFunction<
					typeof actionItemService.getActionItems
				>
			getActionItemsMock.mockResolvedValue(mockActionItems as any)

			mockRequest = {
				query: {},
			}

			await getActionItems(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.getActionItems).toHaveBeenCalledWith({})
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockActionItems,
				count: 2,
			})
		})

		it("should get action items with filters", async () => {
			const mockActionItems = [
				{
					_id: "1",
					text: "High priority action",
					priority: "High",
					status: "Pending",
				},
			]

			const getActionItemsMock =
				actionItemService.getActionItems as jest.MockedFunction<
					typeof actionItemService.getActionItems
				>
			getActionItemsMock.mockResolvedValue(mockActionItems as any)

			mockRequest = {
				query: {
					priority: "High",
					status: "Pending",
					meetingId: "meeting123",
				},
			}

			await getActionItems(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.getActionItems).toHaveBeenCalledWith({
				priority: "High",
				status: "Pending",
				meetingId: "meeting123",
			})
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockActionItems,
				count: 1,
			})
		})

		it("should handle errors", async () => {
			const getActionItemsMock =
				actionItemService.getActionItems as jest.MockedFunction<
					typeof actionItemService.getActionItems
				>
			getActionItemsMock.mockRejectedValue(new Error("Database error"))

			mockRequest = {
				query: {},
			}

			await getActionItems(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(500)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Database error",
			})
		})
	})

	describe("getActionItem", () => {
		it("should get a single action item by ID", async () => {
			const mockActionItem = {
				_id: "123",
				text: "Test Action",
				priority: "High",
				status: "Pending",
			}

			const getActionItemByIdMock =
				actionItemService.getActionItemById as jest.MockedFunction<
					typeof actionItemService.getActionItemById
				>
			getActionItemByIdMock.mockResolvedValue(mockActionItem as any)

			mockRequest = {
				params: { id: "123" },
			}

			await getActionItem(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.getActionItemById).toHaveBeenCalledWith("123")
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockActionItem,
			})
		})

		it("should return 404 when action item not found", async () => {
			const getActionItemByIdMock =
				actionItemService.getActionItemById as jest.MockedFunction<
					typeof actionItemService.getActionItemById
				>
			getActionItemByIdMock.mockResolvedValue(null)

			mockRequest = {
				params: { id: "999" },
			}

			await getActionItem(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(404)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Action item not found",
			})
		})
	})

	describe("getActionItemsByMeeting", () => {
		it("should get action items for a specific meeting", async () => {
			const mockActionItems = [
				{
					_id: "1",
					text: "Action 1",
					priority: "High",
					meetingId: "meeting123",
				},
				{
					_id: "2",
					text: "Action 2",
					priority: "Medium",
					meetingId: "meeting123",
				},
			]

			const getActionItemsByMeetingMock =
				actionItemService.getActionItemsByMeeting as jest.MockedFunction<
					typeof actionItemService.getActionItemsByMeeting
				>
			getActionItemsByMeetingMock.mockResolvedValue(mockActionItems as any)

			mockRequest = {
				params: { meetingId: "meeting123" },
			}

			await getActionItemsByMeeting(
				mockRequest as Request,
				mockResponse as Response
			)

			expect(actionItemService.getActionItemsByMeeting).toHaveBeenCalledWith(
				"meeting123"
			)
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockActionItems,
				count: 2,
			})
		})
	})

	describe("createActionItem", () => {
		it("should create an action item successfully", async () => {
			const mockActionItem = {
				_id: "123",
				text: "New Action",
				priority: "High",
				status: "Pending",
				meetingId: "meeting123",
			}

			const createActionItemMock =
				actionItemService.createActionItem as jest.MockedFunction<
					typeof actionItemService.createActionItem
				>
			createActionItemMock.mockResolvedValue(mockActionItem as any)

			mockRequest = {
				body: {
					meetingId: "meeting123",
					text: "New Action",
					priority: "High",
				},
			}

			await createActionItem(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.createActionItem).toHaveBeenCalledWith({
				meetingId: "meeting123",
				text: "New Action",
				priority: "High",
				status: "Pending",
			})
			expect(responseStatus).toHaveBeenCalledWith(201)
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockActionItem,
				message: "Action item created successfully",
			})
		})

		it("should return 400 when required fields are missing", async () => {
			mockRequest = {
				body: {
					text: "New Action",
					// Missing meetingId and priority
				},
			}

			await createActionItem(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error:
					"Missing required fields: meetingId, text, and priority are required",
			})
		})

		it("should return 400 when priority is invalid", async () => {
			mockRequest = {
				body: {
					meetingId: "meeting123",
					text: "New Action",
					priority: "Invalid",
				},
			}

			await createActionItem(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Invalid priority. Must be High, Medium, or Low",
			})
		})
	})

	describe("updateActionItem", () => {
		it("should update an action item successfully", async () => {
			const mockUpdatedActionItem = {
				_id: "123",
				text: "Updated Action",
				priority: "Medium",
				status: "Completed",
			}

			const updateActionItemMock =
				actionItemService.updateActionItem as jest.MockedFunction<
					typeof actionItemService.updateActionItem
				>
			updateActionItemMock.mockResolvedValue(mockUpdatedActionItem as any)

			mockRequest = {
				params: { id: "123" },
				body: {
					status: "Completed",
					priority: "Medium",
				},
			}

			await updateActionItem(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.updateActionItem).toHaveBeenCalledWith("123", {
				status: "Completed",
				priority: "Medium",
			})
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockUpdatedActionItem,
				message: "Action item updated successfully",
			})
		})

		it("should return 400 when no updates provided", async () => {
			mockRequest = {
				params: { id: "123" },
				body: {},
			}

			await updateActionItem(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "No updates provided",
			})
		})

		it("should return 404 when action item not found", async () => {
			const updateActionItemMock =
				actionItemService.updateActionItem as jest.MockedFunction<
					typeof actionItemService.updateActionItem
				>
			updateActionItemMock.mockResolvedValue(null)

			mockRequest = {
				params: { id: "999" },
				body: {
					status: "Completed",
				},
			}

			await updateActionItem(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(404)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Action item not found",
			})
		})

		it("should return 400 when status is invalid", async () => {
			mockRequest = {
				params: { id: "123" },
				body: {
					status: "Invalid",
				},
			}

			await updateActionItem(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Invalid status. Must be Pending or Completed",
			})
		})
	})

	describe("deleteActionItem", () => {
		it("should delete an action item successfully", async () => {
			const deleteActionItemMock =
				actionItemService.deleteActionItem as jest.MockedFunction<
					typeof actionItemService.deleteActionItem
				>
			deleteActionItemMock.mockResolvedValue(undefined)

			mockRequest = {
				params: { id: "123" },
			}

			await deleteActionItem(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.deleteActionItem).toHaveBeenCalledWith("123")
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				message: "Action item deleted successfully",
			})
		})

		it("should return 404 when action item not found", async () => {
			const deleteActionItemMock =
				actionItemService.deleteActionItem as jest.MockedFunction<
					typeof actionItemService.deleteActionItem
				>
			deleteActionItemMock.mockRejectedValue(new Error("Action item not found"))

			mockRequest = {
				params: { id: "999" },
			}

			await deleteActionItem(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(404)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Action item not found",
			})
		})
	})

	describe("getActionItemStats", () => {
		it("should return action item statistics", async () => {
			const mockStats = {
				total: 10,
				pending: 6,
				completed: 4,
				high: 3,
				medium: 5,
				low: 2,
			}

			const getActionItemStatsMock =
				actionItemService.getActionItemStats as jest.MockedFunction<
					typeof actionItemService.getActionItemStats
				>
			getActionItemStatsMock.mockResolvedValue(mockStats as any)

			mockRequest = {
				query: {},
			}

			await getActionItemStats(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.getActionItemStats).toHaveBeenCalledWith(
				undefined
			)
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockStats,
			})
		})

		it("should return statistics for a specific meeting", async () => {
			const mockStats = {
				total: 5,
				pending: 3,
				completed: 2,
				high: 2,
				medium: 2,
				low: 1,
			}

			const getActionItemStatsMock =
				actionItemService.getActionItemStats as jest.MockedFunction<
					typeof actionItemService.getActionItemStats
				>
			getActionItemStatsMock.mockResolvedValue(mockStats as any)

			mockRequest = {
				query: { meetingId: "meeting123" },
			}

			await getActionItemStats(mockRequest as Request, mockResponse as Response)

			expect(actionItemService.getActionItemStats).toHaveBeenCalledWith(
				"meeting123"
			)
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockStats,
			})
		})
	})
})
