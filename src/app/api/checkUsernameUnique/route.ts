import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User.models';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signupSchema';


const UsernameQuerySchema = z.object({
    username: usernameValidation,
})

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const usernameQueryParam = {
            username: searchParams.get('username')
        }
        const username = UsernameQuerySchema.safeParse(usernameQueryParam);
        console.log(username);
        if (!username.success) {
            return Response.json({ success: false, message: username.error.format().username?._errors }, { status: 400 });
        }
        const existingVerifiedUser = await UserModel.findOne({ username: username.data.username, isVerified: true });
        if (existingVerifiedUser) {
            return Response.json({ success: false, message: "Username already exists" }, { status: 400 });
        }
        return Response.json({ success: true, message: "Username is available" }, { status: 200 });
    } catch (error) {
        console.error("Error in Checking Username", error);
        return Response.json({ success: false, error: "Error in Checking Username" }, { status: 500 });
    }

}