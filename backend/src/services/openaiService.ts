import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

// Define the action item type first
export interface ExtractedActionItem {
	text: string
	priority: "High" | "Medium" | "Low"
	dueDate?: string
	assignee?: string
}

// Create a simple schema without complex type inference
const createActionItemSchema = () => {
	return z.object({
		items: z.array(
			z.object({
				text: z.string(),
				priority: z.enum(["High", "Medium", "Low"]),
				dueDate: z.string().optional(),
				assignee: z.string().optional(),
			})
		),
	})
}

class OpenAIService {
	private model: string

	constructor() {
		const modelName = process.env.OPENAI_MODEL_SUMMARY || "gpt-4o-mini"
		this.model = modelName

		if (!process.env.OPENAI_API_KEY) {
			throw new Error("OPENAI_API_KEY is not defined in environment variables")
		}
	}

	/**
	 * Generate a structured summary of a meeting transcript
	 */
	async summarizeMeeting(transcript: string): Promise<string> {
		try {
			console.log("🤖 Generating meeting summary with AI...")

			const { text } = await generateText({
				model: openai(this.model),
				system: `You are an expert meeting analyst for nonprofits and teams. 
Create concise, structured summaries with the following sections:

**Goals**: Key objectives discussed
**Decisions**: Important decisions made
**Risks**: Potential challenges or concerns raised
**Next Steps**: Planned actions and follow-ups

Be specific, actionable, and concise. Use bullet points. Maximum 700 words.`,
				prompt: `Summarize this meeting transcript:\n\n${transcript}`,
				// maxOutputTokens: 1500,
			})

			console.log("✅ Summary generated successfully")
			return text
		} catch (error: any) {
			console.error("Error generating summary:", error.message)
			throw new Error(`Failed to generate meeting summary: ${error.message}`)
		}
	}

	/**
	 * Extract action items from a meeting transcript with priority levels
	 */
	async extractActionItems(transcript: string): Promise<ExtractedActionItem[]> {
		try {
			console.log("🤖 Extracting action items with AI...")

			const { text } = await generateText({
				model: openai(this.model),
				system: `You are an expert at extracting actionable tasks from meeting transcripts.

Extract clear, specific action items and return them as a JSON object with this exact structure:
{
  "items": [
    {
      "text": "Clear, actionable task description",
      "priority": "High" | "Medium" | "Low",
      "dueDate": "ISO datetime string (optional)",
      "assignee": "Person assigned (optional)"
    }
  ]
}

Priority levels:
- High: Urgent, time-sensitive, or critical impact
- Medium: Important but not urgent
- Low: Nice-to-have or long-term tasks

Use short, imperative phrasing (e.g., "Email the donor list to the board").
Only include dueDate if explicitly mentioned in transcript.
Only include assignee if clearly stated.
Focus on concrete, actionable tasks. Ignore general discussion points.

Return only valid JSON, no additional text.`,
				prompt: `Extract action items from this meeting transcript:\n\n${transcript}`,
				// maxOutputTokens: 2000,
			})

			// Parse the JSON response
			const parsed = JSON.parse(text.trim()) as { items: ExtractedActionItem[] }

			// Validate the structure
			const schema = createActionItemSchema()
			const validated = schema.parse(parsed)

			console.log(`✅ Extracted ${validated.items.length} action items`)
			return validated.items
		} catch (error: any) {
			console.error("Error extracting action items:", error.message)
			throw new Error(`Failed to extract action items: ${error.message}`)
		}
	}

	/**
	 * Stream chat responses with meeting context
	 */
	async streamChat(
		meetingContext: string,
		messages: Array<{ role: string; content: string }>
	) {
		try {
			console.log("🤖 Streaming chat response with meeting context...")

			const result = streamText({
				model: openai(this.model),
				system: `You are a helpful AI assistant that answers questions about a meeting.

Meeting Context:
${meetingContext}

Answer questions based on the meeting context above. If the answer isn't in the context, say so clearly. Be concise and specific. Cite relevant parts of the meeting when possible.`,
				messages: messages as any,
				// maxOutputTokens: 1000,
			})

			return result
		} catch (error: any) {
			console.error("Error streaming chat:", error.message)
			throw new Error(`Failed to stream chat response: ${error.message}`)
		}
	}

	/**
	 * Build meeting context string for chat (summary + action items)
	 */
	buildMeetingContext(
		meetingTitle: string,
		meetingDate: Date,
		summary: string,
		actionItems: Array<{ text: string; priority: string; status: string }>
	): string {
		const formattedDate = meetingDate.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})

		let context = `Meeting: ${meetingTitle}\nDate: ${formattedDate}\n\n`
		context += `Summary:\n${summary}\n\n`

		if (actionItems.length > 0) {
			context += `Action Items:\n`
			actionItems.slice(0, 20).forEach((item, index) => {
				context += `${index + 1}. [${item.priority}] ${item.text} (${
					item.status
				})\n`
			})
		}

		return context
	}
}

export default new OpenAIService()
