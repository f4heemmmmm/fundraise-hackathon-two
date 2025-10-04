import { notFound } from "next/navigation"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { Meeting, getMeetingById } from "@/lib/meetingsData"
import { MeetingTabs } from "@/components/meetingTabs"
import { MeetingChatbot } from "@/components/meetingChatbot"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Users } from "lucide-react"

interface MeetingDetailsPageProps {
  meeting: Meeting
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string }
  const meeting = getMeetingById(id)
  
  if (!meeting) {
    return { notFound: true }
  }
  
  return { props: { meeting } }
}

export default function MeetingDetailsPage({ meeting }: MeetingDetailsPageProps) {

  if (!meeting) {
    notFound()
  }

  const displayName = meeting.name || meeting.contactName || "Untitled Meeting"
  const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Meetings
              </Link>
            </Button>
          </div>

          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={meeting.organizationLogo || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">{displayName}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{meeting.participants.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-background">
          <MeetingTabs summary={meeting.summary} actionItems={meeting.actionItems} transcript={meeting.transcript} />
        </div>

        <div className="w-[400px] lg:w-[480px]">
          <MeetingChatbot />
        </div>
      </div>
    </div>
  )
}
