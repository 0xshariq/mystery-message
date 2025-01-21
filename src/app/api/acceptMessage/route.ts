import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import {dbConnect,dbDisconnect} from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/models/User.models";

/**
 * POST handler for updating user's message acceptance preference
 * @param request - The incoming request object
 * @returns Response with updated user data or error message
 */
export async function POST(request: Request) {
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user: User = session.user;
    const userId = user._id;

    // Extract acceptMessages from request body
    const { acceptMessages } = await request.json();

    try {
        // Update user's message acceptance preference
        const updatedUser = await UserModel.findByIdAndUpdate(
            { _id: userId },
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );

        // Check if user was found and updated
        if (!updatedUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 400 });
        }

        // Return success response with updated user data
        return Response.json({ 
            success: true, 
            message: "Message Acceptance Updated",
            updatedUser 
        }, { status: 200 });

    } catch (error) {
        console.error("Error in Accepting Message", error);
        return Response.json({ success: false, error: "Error in Accepting Message" }, { status: 500 });
    } finally {
        // Disconnect from the database
        await dbDisconnect();
    }
}

/**
 * GET handler for fetching user's current message acceptance preference
 * @param request - The incoming request object (unused, but required for Next.js API routes)
 * @returns Response with user's message acceptance preference or error message
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
    const userId = user._id;

    try {
        // Find the user by ID
        const foundUser = await UserModel.findById(userId);

        // Check if user was found
        if (!foundUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Return success response with user's message acceptance preference
        return Response.json({ 
            success: true, 
            isAcceptingMessage: foundUser.isAcceptingMessages 
        }, { status: 200 });

    } catch (error) {
        console.error("Error in Fetching User", error);
        return Response.json({ success: false, error: "Error in Fetching User" }, { status: 500 });
    } finally {
        // Disconnect from the database
        await dbDisconnect();
    }
}

