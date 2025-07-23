import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/options"
import { dbConnect, dbDisconnect } from "@/lib/dbConnect"
import type { User } from "next-auth"
import UserModel from "@/models/User.models"

/**
 * DELETE handler for removing a specific user message
 * @param request - The incoming request object
 * @param context - The context object containing route parameters
 * @returns NextResponse with operation status and message
 */
export async function DELETE(request: NextRequest, context: { params: { messageid: string } }) {
  const messageId = context.params.messageid

  try {
    // Connect to the database
    await dbConnect()

    // Get the user session
    const session = await getServerSession(authOptions)

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as User

    // Attempt to delete the message from the user's messages array
    const updateResult = await UserModel.updateOne({ _id: user._id }, { $pull: { messages: { _id: messageId } } })

    // Check if the message was found and deleted
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "Message not found or already deleted" }, { status: 404 })
    }

    // Message successfully deleted
    return NextResponse.json({ success: true, message: "Message deleted successfully" }, { status: 200 })
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in deleting user message:", error)

    // Return a generic error message to the client
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the message" },
      { status: 500 },
    )
  } finally {
    // Ensure database connection is closed, even if an error occurred
    await dbDisconnect()
  }
}

