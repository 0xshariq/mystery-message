"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { type AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Message, User } from "@/models/User.models"
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema"
import type { ApiResponse } from "@/types/ApiResponse"

// Define the Dashboard component
const Dashboard = () => {
  // State management
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  // Hooks
  const { toast } = useToast()
  const { data: session } = useSession()
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  })

  // Destructure form methods
  const { register, watch, setValue } = form
  const acceptMessages = watch("acceptMessages")

  // Function to delete a message
  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }

  // Function to handle accepting messages
  const handleAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>(`/api/acceptMessages`)
      setValue("acceptMessages", response.data.isAcceptingMessages)
      toast({
        title: "Message acceptance updated",
        description: "Your message acceptance setting has been updated",
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.error || "Failed to update message acceptance",
        variant: "destructive",
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue, toast])

  // Function to fetch messages
  const fetchMessages = useCallback(
    async (refresh: boolean) => {
      setIsLoading(true)
      try {
        const response = await axios.get<Message[]>("/api/getMessages")
        setMessages(response.data)
        if (refresh) {
          toast({
            title: "Messages refreshed",
            description: "Your messages have been refreshed",
          })
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast({
          title: "Error",
          description: axiosError.response?.data.error || "Failed to fetch messages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  // Effect to fetch messages and set initial state
  useEffect(() => {
    if (!session || !session.user) return

    fetchMessages(false)
    handleAcceptMessage()
  }, [session, fetchMessages, handleAcceptMessage])

  // Function to handle switch change for accepting messages
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/acceptMessages", {
        acceptMessages: !acceptMessages,
      })
      setValue("acceptMessages", !acceptMessages)
      toast({
        title: response.data.message,
        description: "Your message acceptance setting has been updated",
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.error || "Failed to update message acceptance",
        variant: "destructive",
      })
    }
  }

  // Early return if no session
  if (!session || !session.user) {
    return <div>Please Login</div>
  }

  // Extract username from session
  const { username } = session.user as User & { username: string }

  // Construct profile URL
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  // Function to copy profile URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: "Copied",
      description: "Profile URL has been copied to clipboard",
    })
  }

  // Render the dashboard
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      {/* Profile URL section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Profile URL</h2>
        <div className="flex items-center">
          <Input type="text" value={profileUrl} disabled className="input input-bordered w-full p-2 mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      {/* Accept messages toggle */}
      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {acceptMessages ? "On" : "Off"}</span>
      </div>

      <Separator className="my-4" />

      {/* Refresh messages button */}
      <Button className="mt-4" variant="outline" onClick={() => fetchMessages(true)}>
        {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
        Refresh Messages
      </Button>

      {/* Messages display */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message: Message) => (
            <MessageCard key={message._id} message={message} onMessageDelete={handleDeleteMessage} />
          ))
        ) : (
          <p className="font-bold">No Messages to Display</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
