import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/models/User.models";

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const user: User = session.user;
    const userId = user._id;
    const { acceptMessages } = await request.json();
    try {
        const updatedUser = await UserModel.findByIdAndUpdate({ _id: userId }, { isAcceptingMessages: acceptMessages }, { new: true });
        if (!updatedUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 400 });
        }
        return Response.json({ success: true, message: "Message Acceptance Updated",updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error in Accepting Message", error);
        return Response.json({ success: false, error: "Error in Accepting Message" }, { status: 500 });
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request:Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const user: User = session.user;
    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return Response.json({ success: true, isAcceptingMessage: foundUser.isAcceptingMessages }, { status: 200 });
    } catch (error) {
        console.error("Error in Fetching User", error);
        return Response.json({ success: false, error: "Error in Fetching User" }, { status: 500 });
    }
}