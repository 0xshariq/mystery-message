import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User.models';


export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername });
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 400 });
        }
        const isCodeValid = user.verifyCode !== code
        const isCodeNotExpired = new Date(user.verifyCodeExpires) > new Date();
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json({ success: true, message: "User Verified" }, { status: 200 });
        } else if (!isCodeNotExpired) {
            return Response.json({ success: false, message: "Code Expired" }, { status: 400 });
        } else {
            return Response.json({ success: false, message: "Invalid Code" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in Verifying User", error);
        return Response.json({ success: false, error: "Error in Verifying User" }, { status: 500 });

    }
}

