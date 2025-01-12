import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/models/User.models";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const user: User = session.user;
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            {$match: {_id: userId}},
            {$unwind: "$messages"},
            {$sort: {"messages.createdAt": -1}},
            {$group: {
                _id: "$_id",
                messages: {$push: "$messages"}
            }}
        ])
        if (!user || user.length === 0) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return Response.json({ success: true, messages: user[0].messages }, { status: 200 });
    } catch (error) {
        console.error("Error in Fetching User", error);
        return Response.json({ success: false, error: "Error in Fetching User" }, { status: 500 });
        
    }
}