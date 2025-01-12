import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/models/User.models";
import mongoose from "mongoose";

/**
 * GET handler for fetching user messages
 * @param request - The incoming request object (unused, but required for Next.js API routes)
 * @returns Response with user messages or error message
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user: User = session.user;
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        // Fetch user messages using aggregation pipeline
        const userWithMessages = await UserModel.aggregate([
            // Match the user by ID
            { $match: { _id: userId } },
            // Unwind the messages array
            { $unwind: "$messages" },
            // Sort messages by creation date in descending order
            { $sort: { "messages.createdAt": -1 } },
            // Group back the messages
            {
                $group: {
                    _id: "$_id",
                    messages: { $push: "$messages" }
                }
            }
        ]);

        // Check if user was found and has messages
        if (!userWithMessages || userWithMessages.length === 0) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Return success response with user messages
        return Response.json({ 
            success: true, 
            messages: userWithMessages[0].messages 
        }, { status: 200 });

    } catch (error) {
        // Log the error for debugging
        console.error("Error in Fetching User Messages", error);

        // Return error response
        return Response.json({ 
            success: false, 
            error: "Error in Fetching User Messages" 
        }, { status: 500 });
    }
}

