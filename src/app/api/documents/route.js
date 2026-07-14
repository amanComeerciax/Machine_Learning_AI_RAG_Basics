import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB, UserDocument } from "@/lib/db";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const documents = await UserDocument.find({ userId }).sort({ uploadedAt: -1 });

        return NextResponse.json(documents);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
