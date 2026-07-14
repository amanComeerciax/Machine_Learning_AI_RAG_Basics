import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB, DocumentChunk } from "@/lib/db";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

function findRelevantChunks(question, chunks, topK = 3) {
    const words = question.toLowerCase().split(/\s+/);
    return chunks
        .map(chunk => {
            let score = 0;
            const lower = chunk.toLowerCase();
            words.forEach(w => {
                if (w.length > 3 && lower.includes(w)) score++;
            });
            return { chunk, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(i => i.chunk);
}

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { question, history = [] } = await req.json();
        if (!question) {
            return NextResponse.json({ error: "Question required" }, { status: 400 });
        }

        await connectDB();
        const chunksData = await DocumentChunk.find({ userId });
        const textChunks = chunksData.map(c => c.chunkText);

        let context = "";
        if (textChunks.length > 0) {
            const relevantChunks = findRelevantChunks(question, textChunks, 3);
            if (relevantChunks.length > 0) {
                context = relevantChunks.join("\n\n");
            }
        }

        const systemPrompt = context.length > 0
            ? `You are a helpful AI assistant analyzing a PDF document. Here's relevant content:\n\nPDF Content:\n${context}\n\nInstructions: Answer based on the PDF content when relevant. If the PDF doesn't contain the answer, use your general knowledge. Be conversational and helpful.`
            : `You are a helpful AI assistant. Be conversational, clear, and detailed.`;

        const messages = [{ role: "system", content: systemPrompt }];
        const recentHistory = history.slice(-10);
        messages.push(...recentHistory);
        messages.push({ role: "user", content: question });

        console.log('🤖 Sending to Mistral...');
        const result = await mistral.chat.complete({
            model: "mistral-small-latest",
            messages: messages
        });

        const answer = result.choices[0].message.content;

        return NextResponse.json({
            answer,
            sources: textChunks.length > 0 ? 3 : 0,
            hasContext: context.length > 0
        });

    } catch (err) {
        console.error("❌ API Ask error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
