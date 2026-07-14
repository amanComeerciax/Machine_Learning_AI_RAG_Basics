import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB, UserDocument, DocumentChunk } from "@/lib/db";

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        await UserDocument.deleteMany({ userId });
        await DocumentChunk.deleteMany({ userId });

        return NextResponse.json({ message: "System reset successfully" });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
