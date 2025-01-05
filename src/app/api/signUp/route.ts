import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.models";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: Request, response: Response) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username: username,
            isVerified: true,
        })
        if (existingUserVerifiedByUsername) {
            return Response.json({ success: false, error: "Username already exists" }, { status: 400 });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingUserByEmail = await UserModel.findOne({
            email: email,
            isVerified: true,
        })
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({ success: false, message: "Email already exists" }, { status: 400 });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpires = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newUser = await new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpires: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })
            await newUser.save();

            //send verification email
            const emailResponse = await sendVerificationEmail(email, username, verifyCode);
            if (!emailResponse.success) {
                return Response.json({ success: false, message: emailResponse.message }, { status: 500 });
            }
        }
        return Response.json({ success: true, message: "User registered syccessfully, please verify your email" }, { status: 201 });
    } catch (error) {
        console.error("Error registering user", error);
        return Response.json({ success: false, error: "Error registering user" }, { status: 500 });
    }
}
