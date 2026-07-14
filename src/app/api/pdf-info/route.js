import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB, UserDocument, DocumentChunk } from "@/lib/db";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const doc = await UserDocument.findOne({ userId });
        const chunksCount = await DocumentChunk.countDocuments({ userId });

        return NextResponse.json({
            loaded: !!doc,
            metadata: doc ? {
                title: doc.title,
                pages: doc.pages,
                fileType: doc.fileType
            } : null,
            chunks: chunksCount
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
