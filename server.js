

// import express from "express";
// import cors from "cors";
// import fs from "fs";
// import multer from "multer";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// import NodeCache from "node-cache";

// import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
// import { Document } from "@langchain/core/documents";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });

// // ✅ Shared instances (initialized once)
// let vectorStore = null;
// let embeddings = null;
// let chatModel = null;

// // ✅ Cache for repeated questions
// const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

// /* ===============================
//    INITIALIZE ON STARTUP
// ================================ */
// async function initializeApp() {
//     console.log("🔄 Initializing embeddings and model...");

//     // Reuse embeddings instance
//     embeddings = new OllamaEmbeddings({
//         model: "nomic-embed-text",
//         baseUrl: "http://localhost:11434"
//     });

//     // Reuse chat model instance
//     chatModel = new ChatOllama({
//         model: "dolphin-llama3:8b",
//         baseUrl: "http://localhost:11434",
//         temperature: 0.1 // Lower for more consistent answers
//     });

//     // Load existing vector store if available
//     try {
//         if (fs.existsSync("./faiss")) {
//             console.log("📂 Loading existing FAISS index...");
//             vectorStore = await FaissStore.load("./faiss", embeddings);
//             console.log("✅ Vector store loaded from disk");
//         } else {
//             console.log("⚠️ No existing vector store found");
//         }
//     } catch (err) {
//         console.log("⚠️ Error loading vector store:", err.message);
//     }
// }

// /* ===============================
//    PDF UPLOAD → VECTOR DB
// ================================ */
// app.post("/upload", upload.single("pdf"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No PDF uploaded" });
//         }

//         console.log("📄 PDF uploaded:", req.file.originalname);

//         const pdfBuffer = new Uint8Array(fs.readFileSync(req.file.path));
//         const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

//         // ✅ Process pages in parallel for faster extraction
//         const pagePromises = [];
//         for (let i = 1; i <= pdf.numPages; i++) {
//             pagePromises.push(
//                 pdf.getPage(i).then(async (page) => {
//                     const content = await page.getTextContent();
//                     return content.items.map(it => it.str).join(" ");
//                 })
//             );
//         }

//         const pages = await Promise.all(pagePromises);
//         const text = pages.join("\n\n");

//         // ✅ Better chunking strategy
//         const chunks = text
//             .split(/\n{2,}/)
//             .map(t => t.trim())
//             .filter(t => t.length > 50)
//             .slice(0, 500); // Limit chunks for faster indexing

//         if (chunks.length === 0) {
//             fs.unlinkSync(req.file.path);
//             return res.status(400).json({ error: "No text content found in PDF" });
//         }

//         const docs = chunks.map(c => new Document({ pageContent: c }));

//         // ✅ Use pre-initialized embeddings
//         console.log(`🔄 Creating embeddings for ${chunks.length} chunks...`);
//         vectorStore = await FaissStore.fromDocuments(docs, embeddings);

//         // Save to disk
//         await vectorStore.save("./faiss");

//         // Clean up uploaded file
//         fs.unlinkSync(req.file.path);

//         // Clear cache when new PDF is uploaded
//         cache.flushAll();

//         console.log(`✅ PDF indexed successfully: ${chunks.length} chunks`);
//         res.json({
//             message: "PDF indexed successfully",
//             chunks: chunks.length
//         });

//     } catch (err) {
//         console.error("❌ Upload error:", err);
//         if (req.file && fs.existsSync(req.file.path)) {
//             fs.unlinkSync(req.file.path);
//         }
//         res.status(500).json({ error: err.message });
//     }
// });

// /* ===============================
//    ASK QUESTION (OPTIMIZED)
// ================================ */
// app.post("/ask", async (req, res) => {
//     try {
//         const { question } = req.body;

//         if (!question || question.trim().length === 0) {
//             return res.status(400).json({ error: "Question is required" });
//         }

//         // ✅ Check cache first
//         const cacheKey = question.toLowerCase().trim();
//         const cachedAnswer = cache.get(cacheKey);
//         if (cachedAnswer) {
//             console.log("💾 Returning cached answer");
//             return res.json({
//                 answer: cachedAnswer,
//                 cached: true
//             });
//         }

//         // ✅ Load vector store only if not in memory
//         if (!vectorStore) {
//             if (fs.existsSync("./faiss")) {
//                 console.log("📂 Loading vector store...");
//                 vectorStore = await FaissStore.load("./faiss", embeddings);
//             } else {
//                 return res.status(400).json({
//                     error: "No PDF indexed yet. Please upload a PDF first."
//                 });
//             }
//         }

//         console.log("🔍 Searching for relevant context...");

//         // ✅ Similarity search (reduced to 2 for speed)
//         const docs = await vectorStore.similaritySearch(question, 2);

//         if (docs.length === 0) {
//             return res.json({
//                 answer: "No relevant information found in the document."
//             });
//         }

//         const context = docs.map(d => d.pageContent).join("\n\n");

//         console.log("🤖 Generating answer...");

//         // ✅ Use pre-initialized model
//         const response = await chatModel.invoke(`
// You are a helpful assistant. Answer the question based ONLY on the context provided below.
// If the answer is not in the context, say "I don't have enough information to answer that."
// Keep your answer concise and relevant.

// Context:
// ${context}

// Question: ${question}

// Answer:`);

//         const answer = response.content;

//         // ✅ Store in cache
//         cache.set(cacheKey, answer);

//         console.log("✅ Answer generated");

//         res.json({
//             answer: answer,
//             sources: docs.length,
//             cached: false
//         });

//     } catch (err) {
//         console.error("❌ Ask error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// /* ===============================
//    ASK QUESTION (STREAMING)
// ================================ */
// app.post("/ask-stream", async (req, res) => {
//     try {
//         const { question } = req.body;

//         if (!question || question.trim().length === 0) {
//             return res.status(400).json({ error: "Question is required" });
//         }

//         // Set headers for SSE
//         res.setHeader('Content-Type', 'text/event-stream');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Connection', 'keep-alive');

//         if (!vectorStore) {
//             if (fs.existsSync("./faiss")) {
//                 vectorStore = await FaissStore.load("./faiss", embeddings);
//             } else {
//                 res.write(`data: ${JSON.stringify({ error: "No PDF indexed" })}\n\n`);
//                 return res.end();
//             }
//         }

//         const docs = await vectorStore.similaritySearch(question, 2);

//         if (docs.length === 0) {
//             res.write(`data: ${JSON.stringify({ content: "No relevant information found." })}\n\n`);
//             return res.end();
//         }

//         const context = docs.map(d => d.pageContent).join("\n\n");

//         const stream = await chatModel.stream(`
// Answer based ONLY on the context below:

// Context:
// ${context}

// Question: ${question}

// Answer:`);

//         for await (const chunk of stream) {
//             res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
//         }

//         res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
//         res.end();

//     } catch (err) {
//         console.error("❌ Stream error:", err);
//         res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
//         res.end();
//     }
// });

// /* ===============================
//    HEALTH CHECK
// ================================ */
// app.get("/health", (req, res) => {
//     res.json({
//         status: "ok",
//         vectorStoreLoaded: vectorStore !== null,
//         cacheSize: cache.keys().length
//     });
// });

// /* ===============================
//    CLEAR CACHE
// ================================ */
// app.post("/clear-cache", (req, res) => {
//     cache.flushAll();
//     res.json({ message: "Cache cleared successfully" });
// });

// /* ===============================
//    START SERVER
// ================================ */
// async function startServer() {
//     await initializeApp();

//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//         console.log(`🚀 Server running on http://localhost:${PORT}`);
//         console.log(`📊 Health check: http://localhost:${PORT}/health`);
//     });
// }

// startServer().catch(err => {
//     console.error("❌ Failed to start server:", err);
//     process.exit(1);
// });




import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import Groq from "groq-sdk";
import NodeCache from "node-cache";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

// ✅ Groq Client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

let pdfContent = "";
let pdfChunks = [];

/* ===============================
   CHUNK TEXT FUNCTION
================================ */
function chunkText(text, chunkSize = 2000) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = "";

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length < chunkSize) {
            currentChunk += sentence + ". ";
        } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence + ". ";
        }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
}

/* ===============================
   FIND RELEVANT CHUNKS
================================ */
function findRelevantChunks(question, chunks, topK = 3) {
    // Simple keyword-based relevance (you can improve this)
    const questionWords = question.toLowerCase().split(/\s+/);

    const scored = chunks.map(chunk => {
        const chunkLower = chunk.toLowerCase();
        let score = 0;

        questionWords.forEach(word => {
            if (word.length > 3 && chunkLower.includes(word)) {
                score++;
            }
        });

        return { chunk, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(item => item.chunk);
}

/* ===============================
   PDF UPLOAD
================================ */
app.post("/upload", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF uploaded" });
        }

        console.log("📄 PDF uploaded:", req.file.originalname);

        const pdfBuffer = new Uint8Array(fs.readFileSync(req.file.path));
        const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

        // Extract text from all pages
        const pagePromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            pagePromises.push(
                pdf.getPage(i).then(async (page) => {
                    const content = await page.getTextContent();
                    return content.items.map(it => it.str).join(" ");
                })
            );
        }

        const pages = await Promise.all(pagePromises);
        const fullText = pages.join("\n\n");

        // Store content
        pdfContent = fullText;
        pdfChunks = chunkText(fullText);

        // Cleanup
        fs.unlinkSync(req.file.path);

        // Clear cache
        cache.flushAll();

        console.log(`✅ PDF processed: ${pdfChunks.length} chunks created`);

        res.json({
            message: "PDF indexed successfully",
            chunks: pdfChunks.length,
            pages: pdf.numPages
        });

    } catch (err) {
        console.error("❌ Upload error:", err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
    }
});

/* ===============================
   ASK QUESTION (GROQ - FAST MODE)
================================ */
app.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ error: "Question is required" });
        }

        if (!pdfContent || pdfChunks.length === 0) {
            return res.status(400).json({
                error: "No PDF uploaded yet. Please upload a PDF first."
            });
        }

        // Check cache
        const cacheKey = question.toLowerCase().trim();
        const cachedAnswer = cache.get(cacheKey);
        if (cachedAnswer) {
            console.log("💾 Returning cached answer");
            return res.json({
                answer: cachedAnswer,
                cached: true
            });
        }

        console.log("🔍 Question:", question);

        // Find relevant chunks
        const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
        const context = relevantChunks.join("\n\n");

        console.log("📄 Using context:", context.substring(0, 100) + "...");

        // Call Groq API
        const startTime = Date.now();

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant. Answer questions based ONLY on the context provided from the PDF document. If the answer is not in the context, clearly state 'I don't have enough information to answer that question based on the provided document.' Keep answers concise and relevant."
                },
                {
                    role: "user",
                    content: `Context from PDF:\n${context}\n\nQuestion: ${question}\n\nProvide a clear and concise answer based only on the context above:`
                }
            ],
            model: "llama-3.3-70b-versatile", // Fast and good quality
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 1,
            stream: false
        });

        const answer = completion.choices[0].message.content;
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);

        // Cache the answer
        cache.set(cacheKey, answer);

        console.log(`✅ Answer generated in ${responseTime}s`);

        res.json({
            answer: answer,
            cached: false,
            sources: relevantChunks.length,
            responseTime: responseTime + "s"
        });

    } catch (err) {
        console.error("❌ Ask error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ===============================
   ASK QUESTION (STREAMING MODE)
================================ */
app.post("/ask-stream", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ error: "Question is required" });
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (!pdfContent || pdfChunks.length === 0) {
            res.write(`data: ${JSON.stringify({ error: "No PDF uploaded" })}\n\n`);
            return res.end();
        }

        console.log("🌊 Streaming question:", question);

        // Find relevant chunks
        const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
        const context = relevantChunks.join("\n\n");

        // Stream from Groq
        const stream = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant. Answer based only on the context provided."
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 1024,
            stream: true
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (err) {
        console.error("❌ Stream error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        vectorStoreLoaded: pdfContent.length > 0,
        cacheSize: cache.keys().length,
        chunks: pdfChunks.length
    });
});

/* ===============================
   CLEAR CACHE
================================ */
app.post("/clear-cache", (req, res) => {
    cache.flushAll();
    res.json({ message: "Cache cleared successfully" });
});

/* ===============================
   RESET (Clear PDF)
================================ */
app.post("/reset", (req, res) => {
    pdfContent = "";
    pdfChunks = [];
    cache.flushAll();
    res.json({ message: "System reset successfully" });
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Glamour PDF Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`⚡ Powered by Groq API`);
});