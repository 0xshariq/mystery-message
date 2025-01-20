"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Message } from "@/models/User.models";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";


type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
}
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
    const {toast} = useToast();
  const handleDeleteConfirm = async () => {
    const response = await axios.delete<ApiResponse>(`/api/deleteMessage/${message._id}`)
    if(response.data.success) {
        onMessageDelete(message._id as string);
        toast({
            title: "Message Deleted",
            description: "The message has been deleted successfully"
        })
    } else {
        toast({
            title: "Error",
            description: "An error occurred while deleting the message",
        })  
    }
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p>Thank you for your feedback!</p>
          </CardDescription>
        </CardContent>
        <CardFooter>
          <p>From: Anonymous</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MessageCard;
