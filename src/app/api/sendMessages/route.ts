import { dbConnect, dbDisconnect } from "@/lib/dbConnect";
import UserModel, { Message } from "@/models/User.models";
import { z } from "zod";

// Define a schema for input validation
const MessageSchema = z.object({
  username: z.string().min(1, "Username is required"),
  content: z.string().min(1, "Message content is required").max(1000, "Message content is too long")
});

/**
 * POST handler for sending a message to a user
 * @param request - The incoming request object
 * @returns Response indicating the success or failure of sending the message
 */
export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = MessageSchema.parse(body);
    const { username, content } = validatedData;

    // Find the user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { success: false, message: "User is not accepting messages" },
        { status: 403 }
      );
    }

    // Create and add the new message
    const newMessage = {
      content,
      createdAt: new Date()
    };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in sending message:", error);

    if (error instanceof z.ZodError) {
      // Handle validation errors
      return Response.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: "Error in sending message" },
      { status: 500 }
    );
  } finally {
    // Always disconnect from the database
    await dbDisconnect();
  }
}

