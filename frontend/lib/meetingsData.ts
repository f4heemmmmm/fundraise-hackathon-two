export interface Meeting {
  id: string
  name: string
  contactName?: string
  date: string
  participants: string[]
  organizationLogo: string
  summary: string
  actionItems: string[]
  transcript: string
}

export const meetings: Meeting[] = [
  {
    id: "1",
    name: "Q1 Product Strategy",
    contactName: "Sarah Chen",
    date: "2025-03-15",
    participants: ["Sarah Chen", "Michael Torres", "You"],
    organizationLogo: "/tech-company-logo.jpg",
    summary:
      "Discussed product roadmap for Q1 2025. Key focus areas include improving user onboarding flow, implementing new analytics dashboard, and expanding API capabilities. Team agreed on prioritizing mobile experience improvements.",
    actionItems: [
      "Sarah to draft user onboarding wireframes by March 20",
      "Michael to research analytics tools and present options",
      "Schedule follow-up meeting for API expansion discussion",
      "Review mobile design mockups next week",
    ],
    transcript: `Sarah: Let's start with the onboarding flow. We need to reduce time-to-first-value.
Michael: Agreed — I can evaluate analytics tools that show user funnels.
You: I'll pull together mobile mockups for next week and share.`
  },
  {
    id: "2",
    name: "Client Onboarding Review",
    contactName: "David Park",
    date: "2025-03-14",
    participants: ["David Park", "Emily Watson", "You"],
    organizationLogo: "/consulting-firm-logo.png",
    summary:
      "Reviewed onboarding process for new enterprise clients. Identified bottlenecks in documentation phase and discussed automation opportunities. Client feedback has been positive overall with room for improvement in timeline communication.",
    actionItems: [
      "Emily to create automated email templates for onboarding phases",
      "Update client portal with progress tracking feature",
      "David to schedule training session for support team",
      "Implement weekly check-in calls during first month",
    ],
    transcript: `David: The documentation step is slowing us down.
Emily: We should automate emails for each onboarding phase.
You: I can help add progress tracking to the portal so clients see updates.`
  },
  {
    id: "3",
    name: "Marketing Campaign Planning",
    contactName: "Jessica Liu",
    date: "2025-03-13",
    participants: ["Jessica Liu", "Tom Anderson", "Rachel Green", "You"],
    organizationLogo: "/marketing-agency-logo.png",
    summary:
      "Planned Q2 marketing campaign focusing on thought leadership and community engagement. Budget approved for content creation, social media advertising, and event sponsorships. Team aligned on messaging and target audience segments.",
    actionItems: [
      "Jessica to finalize content calendar by end of week",
      "Tom to coordinate with design team on campaign assets",
      "Rachel to reach out to potential event partners",
      "Set up tracking dashboard for campaign metrics",
    ],
    transcript: `Jessica: Our focus is thought leadership and community events.
Tom: Design will prepare hero assets and social templates.
Rachel: I'll contact partners and map out event sponsorships.`
  },
  {
    id: "4",
    name: "Engineering Sync",
    contactName: "Alex Kumar",
    date: "2025-03-12",
    participants: ["Alex Kumar", "Nina Patel", "Chris Johnson", "You"],
    organizationLogo: "/software-company-logo.png",
    summary:
      "Weekly engineering sync covering sprint progress, technical debt, and infrastructure updates. Discussed migration to new cloud provider and performance optimization strategies. Team velocity is on track for quarterly goals.",
    actionItems: [
      "Alex to document migration plan and timeline",
      "Nina to conduct performance audit on critical endpoints",
      "Chris to review and update CI/CD pipeline",
      "Schedule architecture review session for next month",
    ],
    transcript: `Alex: Migration timing needs to align with release windows.
Nina: I'll run a performance audit and report hotspots.
Chris: We'll update CI to include canary deployments during the migration.`
  },
  {
    id: "5",
    name: "Investor Update Meeting",
    contactName: "Robert Martinez",
    date: "2025-03-11",
    participants: ["Robert Martinez", "Linda Thompson", "You"],
    organizationLogo: "/venture-capital-logo.png",
    summary:
      "Quarterly investor update covering financial performance, growth metrics, and strategic initiatives. Investors expressed confidence in current trajectory and provided valuable feedback on market positioning. Discussed potential Series B timeline.",
    actionItems: [
      "Prepare detailed financial projections for next quarter",
      "Linda to compile customer success stories and case studies",
      "Schedule individual calls with key investors",
      "Update investor deck with latest product screenshots",
    ],
    transcript: `Robert: Investors are pleased with growth metrics but want more clarity on runway.
Linda: We'll prepare case studies highlighting retention improvements.
You: I'll update the deck and include recent product metrics.`
  },
  {
    id: "6",
    name: "Partnership Discussion",
    contactName: "Maria Garcia",
    date: "2025-03-10",
    participants: ["Maria Garcia", "James Wilson", "You"],
    organizationLogo: "/enterprise-company-logo.png",
    summary:
      "Exploratory meeting about potential strategic partnership. Discussed integration opportunities, go-to-market strategy, and mutual value proposition. Both parties interested in moving forward with pilot program.",
    actionItems: [
      "Maria to draft partnership proposal and terms",
      "James to coordinate technical integration assessment",
      "Schedule follow-up meeting with legal teams",
      "Prepare pilot program scope and success metrics",
    ],
    transcript: `Maria: A pilot program will help validate integration value.
James: We'll scope the technical assessment and identify API touchpoints.
You: Let's define success metrics so the pilot has clear goals.`
  },
]

export function getMeetingById(id: string): Meeting | undefined {
  return meetings.find((meeting) => meeting.id === id)
}
