import { auth } from "@clerk/nextjs/server";
import { connectDB, DocumentChunk, UserDocument } from "@/lib/db";
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
            return new Response("Unauthorized", { status: 401 });
        }

        const { question, history = [], documentId } = await req.json();
        if (!question) {
            return new Response("Question required", { status: 400 });
        }

        await connectDB();
        
        let chunksData = [];
        if (documentId) {
            chunksData = await DocumentChunk.find({ documentId });
        } else {
            chunksData = await DocumentChunk.find({ userId });
        }
        
        const textChunks = chunksData.map(c => c.chunkText);

        let context = "";
        if (textChunks.length > 0) {
            const relevantChunks = findRelevantChunks(question, textChunks, 3);
            if (relevantChunks.length > 0) {
                context = relevantChunks.join("\n\n");
            }
        }

        const systemPrompt = context.length > 0
            ? `You are a helpful AI assistant analyzing a PDF document. Here's relevant content:\n\n${context}\n\nAnswer based on the document when relevant, otherwise use your knowledge. Be conversational.`
            : `You are a helpful AI assistant. Be conversational and clear.`;

        const messages = [{ role: "system", content: systemPrompt }];
        const recentHistory = history.slice(-10);
        messages.push(...recentHistory);
        messages.push({ role: "user", content: question });

        const result = await mistral.chat.stream({
            model: "mistral-small-latest",
            messages: messages
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let fullAnswer = "";
                    for await (const event of result) {
                        const content = event.data?.choices?.[0]?.delta?.content || "";
                        if (content) {
                            fullAnswer += content;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                        }
                    }

                    // Save the complete conversation to DB
                    if (documentId && fullAnswer) {
                        await UserDocument.findByIdAndUpdate(documentId, {
                            $push: {
                                messages: {
                                    $each: [
                                        { role: "user", content: question, timestamp: new Date() },
                                        { role: "assistant", content: fullAnswer, timestamp: new Date() }
                                    ]
                                }
                            }
                        });
                    }

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        done: true,
                        sources: textChunks.length > 0 ? 3 : 0
                    })}\n\n`));
                } catch (e) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });

    } catch (err) {
        console.error("❌ API Stream error:", err);
        return new Response(err.message, { status: 500 });
    }
}
