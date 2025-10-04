import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users } from "lucide-react"
import type { Meeting } from "@/lib/meetingsData"

interface MeetingCardProps {
  meeting: Meeting
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const displayName = meeting.name || meeting.contactName || "Untitled Meeting"
  const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <Card className="p-6 hover:bg-secondary/50 transition-colors cursor-pointer border-border">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={meeting.organizationLogo || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback className="bg-muted text-muted-foreground">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1 text-balance">{displayName}</h3>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{meeting.participants.length} participants</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {meeting.participants.slice(0, 3).map((participant, index) => (
                <span key={index} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  {participant}
                </span>
              ))}
              {meeting.participants.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  +{meeting.participants.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
