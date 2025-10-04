/**
 * Unit tests for Meeting Controller
 * Run with: npm test -- meetingController.test.ts
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { Request, Response } from "express"
import {
	getMeetings,
	getMeeting,
	createMeeting,
	processMeeting,
	updateMeeting,
	deleteMeeting,
	getMeetingStats,
} from "../controllers/meetingController"
import meetingService from "../services/meetingService"

// Mock the meeting service
jest.mock("../services/meetingService")

describe("Meeting Controller", () => {
	let mockRequest: Partial<Request>
	let mockResponse: Partial<Response>
	let responseJson: jest.MockedFunction<any>
	let responseStatus: jest.MockedFunction<any>

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks()

		// Setup mock response
		responseJson = jest.fn() as jest.MockedFunction<any>
		responseStatus = jest
			.fn()
			.mockReturnValue({ json: responseJson }) as jest.MockedFunction<any>

		mockResponse = {
			json: responseJson,
			status: responseStatus,
		} as Partial<Response>
	})

	describe("getMeetings", () => {
		it("should return all meetings successfully", async () => {
			const mockMeetings = [
				{ _id: "1", title: "Meeting 1", status: "completed" },
				{ _id: "2", title: "Meeting 2", status: "pending" },
			]

			const getMeetingsMock = meetingService.getMeetings as jest.MockedFunction<
				typeof meetingService.getMeetings
			>
			getMeetingsMock.mockResolvedValue(mockMeetings as any)

			mockRequest = {
				query: {},
			}

			await getMeetings(mockRequest as Request, mockResponse as Response)

			expect(meetingService.getMeetings).toHaveBeenCalledWith({})
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockMeetings,
				count: 2,
			})
		})

		it("should filter meetings by status", async () => {
			const mockMeetings = [
				{ _id: "1", title: "Meeting 1", status: "completed" },
			]

			const getMeetingsMock = meetingService.getMeetings as jest.MockedFunction<
				typeof meetingService.getMeetings
			>
			getMeetingsMock.mockResolvedValue(mockMeetings as any)

			mockRequest = {
				query: { status: "completed" },
			}

			await getMeetings(mockRequest as Request, mockResponse as Response)

			expect(meetingService.getMeetings).toHaveBeenCalledWith({
				status: "completed",
			})
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockMeetings,
				count: 1,
			})
		})

		it("should return 400 for invalid status", async () => {
			mockRequest = {
				query: { status: "invalid-status" },
			}

			await getMeetings(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: expect.stringContaining("Invalid status"),
			})
		})

		it("should handle errors", async () => {
			const getMeetingsMock = meetingService.getMeetings as jest.MockedFunction<
				typeof meetingService.getMeetings
			>
			getMeetingsMock.mockRejectedValue(new Error("Database error"))

			mockRequest = {
				query: {},
			}

			await getMeetings(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(500)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Database error",
			})
		})
	})

	describe("getMeeting", () => {
		it("should return a single meeting", async () => {
			const mockMeeting = {
				_id: "123",
				title: "Test Meeting",
				status: "completed",
			}

			const getMeetingByIdMock =
				meetingService.getMeetingById as jest.MockedFunction<
					typeof meetingService.getMeetingById
				>
			getMeetingByIdMock.mockResolvedValue(mockMeeting as any)

			mockRequest = {
				params: { id: "123" },
			}

			await getMeeting(mockRequest as Request, mockResponse as Response)

			expect(meetingService.getMeetingById).toHaveBeenCalledWith("123")
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockMeeting,
			})
		})

		it("should return 404 when meeting not found", async () => {
			const getMeetingByIdMock =
				meetingService.getMeetingById as jest.MockedFunction<
					typeof meetingService.getMeetingById
				>
			getMeetingByIdMock.mockRejectedValue(new Error("Meeting not found"))

			mockRequest = {
				params: { id: "123" },
			}

			await getMeeting(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(404)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Meeting not found",
			})
		})
	})

	describe("createMeeting", () => {
		it("should create a meeting successfully", async () => {
			const mockMeeting = {
				_id: "123",
				title: "New Meeting",
				date: new Date("2025-01-15"),
				duration: 60,
				status: "pending",
			}

			const createMeetingMock =
				meetingService.createMeeting as jest.MockedFunction<
					typeof meetingService.createMeeting
				>
			createMeetingMock.mockResolvedValue(mockMeeting as any)

			mockRequest = {
				body: {
					title: "New Meeting",
					date: "2025-01-15",
					duration: 60,
				},
			}

			await createMeeting(mockRequest as Request, mockResponse as Response)

			expect(meetingService.createMeeting).toHaveBeenCalledWith({
				title: "New Meeting",
				date: expect.any(Date),
				duration: 60,
				transcriptUrl: undefined,
				transcriptText: undefined,
				notetakerId: undefined,
			})
			expect(responseStatus).toHaveBeenCalledWith(201)
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockMeeting,
				message: "Meeting created successfully",
			})
		})

		it("should return 400 when required fields are missing", async () => {
			mockRequest = {
				body: {
					title: "New Meeting",
					// missing date and duration
				},
			}

			await createMeeting(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: expect.stringContaining("required fields"),
			})
		})

		it("should return 400 when duration is invalid", async () => {
			mockRequest = {
				body: {
					title: "New Meeting",
					date: "2025-01-15",
					duration: -10,
				},
			}

			await createMeeting(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: expect.stringContaining("positive number"),
			})
		})
	})

	describe("processMeeting", () => {
		it("should process a meeting successfully", async () => {
			const mockProcessedMeeting = {
				_id: "123",
				title: "Test Meeting",
				status: "completed",
				summary: "Meeting summary",
				actionItems: [{ text: "Action 1" }],
			}

			const processMeetingMock =
				meetingService.processMeeting as jest.MockedFunction<
					typeof meetingService.processMeeting
				>
			processMeetingMock.mockResolvedValue(mockProcessedMeeting as any)

			mockRequest = {
				params: { id: "123" },
			}

			await processMeeting(mockRequest as Request, mockResponse as Response)

			expect(meetingService.processMeeting).toHaveBeenCalledWith("123")
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockProcessedMeeting,
				message: "Meeting processed successfully",
			})
		})

		it("should return 400 when no transcript available", async () => {
			const processMeetingMock =
				meetingService.processMeeting as jest.MockedFunction<
					typeof meetingService.processMeeting
				>
			processMeetingMock.mockRejectedValue(
				new Error("No transcript available for processing")
			)

			mockRequest = {
				params: { id: "123" },
			}

			await processMeeting(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "Meeting has no transcript to process",
			})
		})
	})

	describe("updateMeeting", () => {
		it("should update a meeting successfully", async () => {
			const mockUpdatedMeeting = {
				_id: "123",
				title: "Updated Meeting",
				duration: 90,
			}

			const updateMeetingMock =
				meetingService.updateMeeting as jest.MockedFunction<
					typeof meetingService.updateMeeting
				>
			updateMeetingMock.mockResolvedValue(mockUpdatedMeeting as any)

			mockRequest = {
				params: { id: "123" },
				body: {
					title: "Updated Meeting",
					duration: 90,
				},
			}

			await updateMeeting(mockRequest as Request, mockResponse as Response)

			expect(meetingService.updateMeeting).toHaveBeenCalledWith("123", {
				title: "Updated Meeting",
				duration: 90,
			})
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockUpdatedMeeting,
				message: "Meeting updated successfully",
			})
		})

		it("should return 400 when no updates provided", async () => {
			mockRequest = {
				params: { id: "123" },
				body: {},
			}

			await updateMeeting(mockRequest as Request, mockResponse as Response)

			expect(responseStatus).toHaveBeenCalledWith(400)
			expect(responseJson).toHaveBeenCalledWith({
				success: false,
				error: "No updates provided",
			})
		})
	})

	describe("deleteMeeting", () => {
		it("should delete a meeting successfully", async () => {
			const deleteMeetingMock =
				meetingService.deleteMeeting as jest.MockedFunction<
					typeof meetingService.deleteMeeting
				>
			deleteMeetingMock.mockResolvedValue(undefined)

			mockRequest = {
				params: { id: "123" },
			}

			await deleteMeeting(mockRequest as Request, mockResponse as Response)

			expect(meetingService.deleteMeeting).toHaveBeenCalledWith("123")
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				message: "Meeting and associated action items deleted successfully",
			})
		})
	})

	describe("getMeetingStats", () => {
		it("should return meeting statistics", async () => {
			const mockStats = {
				total: 10,
				pending: 2,
				processing: 1,
				completed: 6,
				failed: 1,
			}

			const getMeetingStatsMock =
				meetingService.getMeetingStats as jest.MockedFunction<
					typeof meetingService.getMeetingStats
				>
			getMeetingStatsMock.mockResolvedValue(mockStats as any)

			mockRequest = {}

			await getMeetingStats(mockRequest as Request, mockResponse as Response)

			expect(meetingService.getMeetingStats).toHaveBeenCalled()
			expect(responseJson).toHaveBeenCalledWith({
				success: true,
				data: mockStats,
			})
		})
	})
})
