"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface MeetingTabsProps {
  actionItems: string[]
  summary: string
  transcript: string
}

type Tab = "summary" | "action-items" | "transcript"

export function MeetingTabs({ actionItems, summary, transcript }: MeetingTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("action-items")

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border">
        <div className="flex gap-6 px-6">
          <button
            onClick={() => setActiveTab("action-items")}
            className={cn(
              "py-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === "action-items"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Action Items
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "py-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === "summary"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={cn(
              "py-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === "transcript"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Transcript
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "summary" && (
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">{summary}</p>
          </div>
        )}

        {activeTab === "action-items" && (
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 border border-accent flex items-center justify-center mt-0.5">
                  <span className="text-xs text-accent font-medium">{index + 1}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">{item}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "transcript" && (
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  )
}
