import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/options"
import { dbConnect, dbDisconnect } from "@/lib/dbConnect"
import type { User } from "next-auth"
import UserModel from "@/models/User.models"

/**
 * DELETE handler for removing a specific user message
 * @param request - The incoming request object (unused, but required for Next.js API routes)
 * @param params - Object containing route parameters
 * @param params.messageid - The ID of the message to be deleted
 * @returns Response with operation status and message
 */
export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
  const messageId = params.messageid

  try {
    // Connect to the database
    await dbConnect()

    // Get the user session
    const session = await getServerSession(authOptions)

    // Check if the user is authenticated
    if (!session || !session.user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const user: User = session.user

    // Attempt to delete the message from the user's messages array
    const updateResult = await UserModel.updateOne({ _id: user._id }, { $pull: { messages: { _id: messageId } } })

    // Check if the message was found and deleted
    if (updateResult.modifiedCount === 0) {
      return Response.json({ success: false, message: "Message not found or already deleted" }, { status: 404 })
    }

    // Message successfully deleted
    return Response.json({ success: true, message: "Message deleted successfully" }, { status: 200 })
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in deleting user message:", error)

    // Return a generic error message to the client
    return Response.json({ success: false, message: "An error occurred while deleting the message" }, { status: 500 })
  } finally {
    // Ensure database connection is closed, even if an error occurred
    await dbDisconnect()
  }
}

