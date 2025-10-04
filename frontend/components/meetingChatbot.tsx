"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function MeetingChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I can help you with questions about this meeting. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content:
          "This is a demo response. In a real implementation, this would connect to an AI service to provide intelligent answers about the meeting content.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 500)

    setInput("")
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Meeting Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask me anything about this meeting</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-accent" />
              </div>
            )}

            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" size="icon" className="flex-shrink-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
