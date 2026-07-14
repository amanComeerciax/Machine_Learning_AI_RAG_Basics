import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB, UserDocument, DocumentChunk } from "@/lib/db";

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { documentId } = await req.json().catch(() => ({}));

        await connectDB();

        if (documentId) {
            // Delete specific document and its chunks
            await UserDocument.deleteOne({ _id: documentId, userId });
            await DocumentChunk.deleteMany({ documentId, userId });
            return NextResponse.json({ message: "Document deleted successfully" });
        } else {
            // Delete all user documents (system reset)
            await UserDocument.deleteMany({ userId });
            await DocumentChunk.deleteMany({ userId });
            return NextResponse.json({ message: "System reset successfully" });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
