import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { dbConnect, dbDisconnect } from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/models/User.models";

/**
 * GET handler for fetching user messages
 * @param request - The incoming request object (unused, but required for Next.js API routes)
 * @returns Response with user messages or error message
 */
export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid;
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user: User = session.user;

    try {
       const updateResult= await UserModel.updateOne({ _id: user._id }, { $pull: { messages: { _id: messageId } } });
       if(updateResult.modifiedCount === 0) {
           return Response.json({ success: false, message: "Message not found or Already Deleted" }, { status: 404 });
       }
         return Response.json({ success: true, message: "Message deleted successfully" }, { status: 200 });
    } catch (error) {
        // Log the error for debugging
        console.error("Error in Deleting User Message", error);
        return Response.json({ success: false, message: "An error occurred while deleting the message" }, { status: 500 });
    }
    finally {
        // Always disconnect from the database
        await dbDisconnect();
    }
}

