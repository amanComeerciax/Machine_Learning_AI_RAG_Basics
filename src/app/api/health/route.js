import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB, DocumentChunk } from "@/lib/db";

export async function GET() {
    try {
        const { userId } = await auth();
        let chunksCount = 0;
        if (userId) {
            await connectDB();
            chunksCount = await DocumentChunk.countDocuments({ userId });
        }
        return NextResponse.json({
            status: "ok",
            chunks: chunksCount,
            vectorStoreLoaded: chunksCount > 0,
            clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || ""
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
