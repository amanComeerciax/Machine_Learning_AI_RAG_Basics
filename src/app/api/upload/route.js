import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB, UserDocument, DocumentChunk } from "@/lib/db";
import pdf from "pdf-parse";

function chunkText(text, chunkSize = 2000) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/);
    let current = "";

    for (const s of sentences) {
        if ((current + s).length < chunkSize) {
            current += s + ". ";
        } else {
            if (current) chunks.push(current.trim());
            current = s + ". ";
        }
    }
    if (current) chunks.push(current.trim());
    return chunks;
}

export async function POST(req) {
    try {
        const authObj = await auth();
        const userId = authObj?.userId;
        
        console.log("🔒 --- API Auth Debug ---");
        console.log("Authorization Header:", req.headers.get("authorization"));
        console.log("Clerk Auth Object:", JSON.stringify(authObj));
        console.log("Clerk User ID:", userId);
        console.log("------------------------");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("pdf");
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        let text = "";
        let pages = 1;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (fileExtension === 'pdf') {
            const data = await pdf(buffer);
            text = data.text;
            pages = data.numpages;
        } else if (fileExtension === 'txt') {
            text = buffer.toString('utf8');
            pages = Math.ceil(text.length / 2000);
        } else {
            return NextResponse.json({ error: "Unsupported file type. Please upload PDF or TXT files only." }, { status: 400 });
        }

        await connectDB();
        
        // Clean up old docs for the user
        await UserDocument.deleteMany({ userId });
        await DocumentChunk.deleteMany({ userId });

        // Save new doc
        const userDoc = new UserDocument({
            userId,
            title: fileName,
            pages,
            fileType: fileExtension.toUpperCase()
        });
        await userDoc.save();

        // Chunk and save chunks
        const chunks = chunkText(text);
        const chunkDocs = chunks.map(chunkText => ({
            userId,
            documentId: userDoc._id,
            chunkText
        }));

        if (chunkDocs.length > 0) {
            await DocumentChunk.insertMany(chunkDocs);
        }

        return NextResponse.json({
            message: `${fileExtension.toUpperCase()} indexed successfully`,
            title: userDoc.title,
            pages: userDoc.pages,
            fileType: userDoc.fileType,
            chunks: chunks.length
        });

    } catch (err) {
        console.error("❌ Upload Route error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
