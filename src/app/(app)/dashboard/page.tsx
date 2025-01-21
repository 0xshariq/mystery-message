"use client";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/models/User.models";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };
  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });
  console.log(form);

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAcceptMessage = React.useCallback(async (messageId: string) => {
      setIsSwitchLoading(true);
      try {
        const response = await axios.get<ApiResponse>(`/api/acceptMessages`);
        setValue("acceptMessages", response.data.isAcceptingMessages);
        toast({
          title: "Message accepted",
          description: "The message has been accepted",
        });
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.error || "Failed to accept message",
          variant: "destructive",
        });
      } finally {
        setIsSwitchLoading(false);
      }
    }, [setValue, toast]);

  const fetchMessages = React.useCallback(async (refresh: boolean) => {
    setIsLoading(true);
    setIsSwitchLoading(false);
    try {
      const response = await axios.get<Message[]>("/api/getMessages");
      setMessages(response.data);
      if (refresh) {
        toast({
          title: "Messages refreshed",
          description: "Messages have been refreshed",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.error || "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session || !session.user) {
      return;
    }
    fetchMessages(false);
    if (messages.length > 0 && typeof messages[0]._id === "string") {
      handleAcceptMessage(messages[0]._id);
    }
  }, [session, setValue, fetchMessages, handleAcceptMessage, messages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/acceptMessages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
        description: "Messages have been accepted",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.error || "Failed to accept messages",
        variant: "destructive",
      });
    }
  };

  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Copied",
      description: "Profile URL has been copied to clipboard",
    });
  };

  if (!session || !session.user) {
    return <div>Please Login</div>;
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Profile URL</h2>
        {""}
        <div className=" flex items-center">
          <Input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
        <div className="mb-4">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="mb-4">
            Accept Messages : {acceptMessages ? "On" : "Off"}
          </span>
        </div>
        <Separator />
        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0 ? (
            messages.map((message: Message) => (
              <MessageCard
                key={message._id}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p className="font-bold">No Messages to Display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
