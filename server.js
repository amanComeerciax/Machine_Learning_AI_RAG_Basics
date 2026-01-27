

// // // import express from "express";
// // // import cors from "cors";
// // // import fs from "fs";
// // // import multer from "multer";
// // // import { createRequire } from "module";
// // // const require = createRequire(import.meta.url);
// // // const pdf = require("pdf-parse");

// // // import Groq from "groq-sdk";
// // // import NodeCache from "node-cache";
// // // import dotenv from "dotenv";
// // // dotenv.config();

// // // const app = express();
// // // app.use(cors());
// // // app.use(express.json());

// // // const upload = multer({ dest: "uploads/" });
// // // const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

// // // /* ===============================
// // //    GROQ CLIENT
// // // ================================ */
// // // const groq = new Groq({
// // //     apiKey: process.env.GROQ_API_KEY
// // // });

// // // let pdfContent = "";
// // // let pdfChunks = [];

// // // /* ===============================
// // //    CHUNK TEXT
// // // ================================ */
// // // function chunkText(text, chunkSize = 2000) {
// // //     const chunks = [];
// // //     const sentences = text.split(/[.!?]+/);
// // //     let current = "";

// // //     for (const s of sentences) {
// // //         if ((current + s).length < chunkSize) {
// // //             current += s + ". ";
// // //         } else {
// // //             chunks.push(current.trim());
// // //             current = s + ". ";
// // //         }
// // //     }
// // //     if (current) chunks.push(current.trim());
// // //     return chunks;
// // // }

// // // /* ===============================
// // //    SIMPLE RELEVANCE SEARCH
// // // ================================ */
// // // function findRelevantChunks(question, chunks, topK = 3) {
// // //     const words = question.toLowerCase().split(/\s+/);

// // //     return chunks
// // //         .map(chunk => {
// // //             let score = 0;
// // //             const lower = chunk.toLowerCase();
// // //             words.forEach(w => {
// // //                 if (w.length > 3 && lower.includes(w)) score++;
// // //             });
// // //             return { chunk, score };
// // //         })
// // //         .sort((a, b) => b.score - a.score)
// // //         .slice(0, topK)
// // //         .map(i => i.chunk);
// // // }

// // // /* ===============================
// // //    PDF UPLOAD (pdf-parse ONLY)
// // // ================================ */
// // // app.post("/upload", upload.single("pdf"), async (req, res) => {
// // //     try {
// // //         if (!req.file) {
// // //             return res.status(400).json({ error: "No PDF uploaded" });
// // //         }

// // //         console.log("📄 PDF uploaded:", req.file.originalname);

// // //         const buffer = fs.readFileSync(req.file.path);
// // //         const data = await pdf(buffer);

// // //         pdfContent = data.text;
// // //         pdfChunks = chunkText(pdfContent);

// // //         fs.unlinkSync(req.file.path);
// // //         cache.flushAll();

// // //         console.log(`✅ PDF processed: ${pdfChunks.length} chunks`);

// // //         res.json({
// // //             message: "PDF indexed successfully",
// // //             pages: data.numpages,
// // //             chunks: pdfChunks.length
// // //         });

// // //     } catch (err) {
// // //         console.error("❌ Upload error:", err);
// // //         res.status(500).json({ error: err.message });
// // //     }
// // // });

// // // /* ===============================
// // //    ASK QUESTION (FAST MODE)
// // // ================================ */
// // // app.post("/ask", async (req, res) => {
// // //     try {
// // //         const { question } = req.body;

// // //         if (!question) {
// // //             return res.status(400).json({ error: "Question required" });
// // //         }

// // //         if (!pdfChunks.length) {
// // //             return res.status(400).json({ error: "Upload a PDF first" });
// // //         }

// // //         const cacheKey = question.toLowerCase().trim();
// // //         const cached = cache.get(cacheKey);
// // //         if (cached) {
// // //             return res.json({ answer: cached, cached: true });
// // //         }

// // //         const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
// // //         const context = relevantChunks.join("\n\n");

// // //         const completion = await groq.chat.completions.create({
// // //             model: "llama-3.3-70b-versatile",
// // //             temperature: 0.3,
// // //             max_tokens: 1024,
// // //             messages: [
// // //                 {
// // //                     role: "system",
// // //                     content:
// // //                         "Answer ONLY from the provided PDF context. If answer is not present, say you don't know."
// // //                 },
// // //                 {
// // //                     role: "user",
// // //                     content: `Context:\n${context}\n\nQuestion: ${question}`
// // //                 }
// // //             ]
// // //         });

// // //         const answer = completion.choices[0].message.content;
// // //         cache.set(cacheKey, answer);

// // //         res.json({
// // //             answer,
// // //             cached: false,
// // //             sources: relevantChunks.length
// // //         });

// // //     } catch (err) {
// // //         console.error("❌ Ask error:", err);
// // //         res.status(500).json({ error: err.message });
// // //     }
// // // });

// // // /* ===============================
// // //    ASK QUESTION (STREAMING MODE)
// // // ================================ */
// // // app.post("/ask-stream", async (req, res) => {
// // //     try {
// // //         const { question } = req.body;

// // //         if (!question) {
// // //             return res.status(400).json({ error: "Question required" });
// // //         }

// // //         if (!pdfChunks.length) {
// // //             return res.status(400).json({ error: "Upload a PDF first" });
// // //         }

// // //         // Set headers for SSE (Server-Sent Events)
// // //         res.setHeader('Content-Type', 'text/event-stream');
// // //         res.setHeader('Cache-Control', 'no-cache');
// // //         res.setHeader('Connection', 'keep-alive');

// // //         const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
// // //         const context = relevantChunks.join("\n\n");

// // //         const stream = await groq.chat.completions.create({
// // //             model: "llama-3.3-70b-versatile",
// // //             temperature: 0.3,
// // //             max_tokens: 1024,
// // //             stream: true,
// // //             messages: [
// // //                 {
// // //                     role: "system",
// // //                     content:
// // //                         "Answer ONLY from the provided PDF context. If answer is not present, say you don't know."
// // //                 },
// // //                 {
// // //                     role: "user",
// // //                     content: `Context:\n${context}\n\nQuestion: ${question}`
// // //                 }
// // //             ]
// // //         });

// // //         let fullAnswer = "";

// // //         for await (const chunk of stream) {
// // //             const content = chunk.choices[0]?.delta?.content || "";
// // //             if (content) {
// // //                 fullAnswer += content;
// // //                 // Send the chunk to the client
// // //                 res.write(`data: ${JSON.stringify({ content })}\n\n`);
// // //             }
// // //         }

// // //         // Cache the complete answer
// // //         const cacheKey = question.toLowerCase().trim();
// // //         cache.set(cacheKey, fullAnswer);

// // //         // Send completion signal
// // //         res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
// // //         res.end();

// // //     } catch (err) {
// // //         console.error("❌ Stream error:", err);
// // //         res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
// // //         res.end();
// // //     }
// // // });

// // // /* ===============================
// // //    HEALTH CHECK
// // // ================================ */
// // // app.get("/health", (req, res) => {
// // //     res.json({
// // //         status: "ok",
// // //         chunks: pdfChunks.length,
// // //         cacheSize: cache.keys().length
// // //     });
// // // });

// // // /* ===============================
// // //    RESET
// // // ================================ */
// // // app.post("/reset", (req, res) => {
// // //     pdfContent = "";
// // //     pdfChunks = [];
// // //     cache.flushAll();
// // //     res.json({ message: "System reset" });
// // // });

// // // /* ===============================
// // //    START SERVER
// // // ================================ */
// // // const PORT = process.env.PORT || 3000;
// // // app.listen(PORT, () => {
// // //     console.log(`🚀 PDF RAG Server running on port ${PORT}`);
// // //     console.log(`📡 Endpoints:`);
// // //     console.log(`   POST /upload - Upload PDF`);
// // //     console.log(`   POST /ask - Fast mode (no streaming)`);
// // //     console.log(`   POST /ask-stream - Streaming mode`);
// // //     console.log(`   POST /reset - Reset system`);
// // //     console.log(`   GET /health - Health check`);
// // // });


// // import express from "express";
// // import cors from "cors";
// // import fs from "fs";
// // import multer from "multer";
// // import { createRequire } from "module";
// // const require = createRequire(import.meta.url);
// // const pdf = require("pdf-parse");

// // import Groq from "groq-sdk";
// // import NodeCache from "node-cache";
// // import dotenv from "dotenv";
// // dotenv.config();

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // const upload = multer({ dest: "uploads/" });
// // const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

// // /* ===============================
// //    GROQ CLIENT
// // ================================ */
// // const groq = new Groq({
// //     apiKey: process.env.GROQ_API_KEY
// // });

// // let pdfContent = "";
// // let pdfChunks = [];
// // let pdfSummary = "";
// // let pdfTitle = "";

// // /* ===============================
// //    IMPROVED CHUNK TEXT WITH OVERLAP
// // ================================ */
// // function chunkText(text, chunkSize = 1500, overlap = 200) {
// //     const chunks = [];
// //     const sentences = text.split(/(?<=[.!?])\s+/);
// //     let current = "";

// //     for (let i = 0; i < sentences.length; i++) {
// //         const sentence = sentences[i];

// //         if ((current + sentence).length < chunkSize) {
// //             current += sentence + " ";
// //         } else {
// //             if (current.trim()) {
// //                 chunks.push(current.trim());
// //             }

// //             // Add overlap from previous chunk
// //             const words = current.split(/\s+/);
// //             const overlapWords = words.slice(-Math.floor(overlap / 5)).join(" ");
// //             current = overlapWords + " " + sentence + " ";
// //         }
// //     }

// //     if (current.trim()) {
// //         chunks.push(current.trim());
// //     }

// //     return chunks.filter(chunk => chunk.length > 100);
// // }

// // /* ===============================
// //    IMPROVED RELEVANCE SEARCH
// // ================================ */
// // function findRelevantChunks(question, chunks, topK = 5) {
// //     const questionWords = question.toLowerCase()
// //         .split(/\s+/)
// //         .filter(w => w.length > 3);

// //     if (questionWords.length === 0) {
// //         return chunks.slice(0, topK);
// //     }

// //     const scoredChunks = chunks.map(chunk => {
// //         const lowerChunk = chunk.toLowerCase();
// //         let score = 0;

// //         // Word frequency scoring
// //         questionWords.forEach(word => {
// //             const regex = new RegExp(word, 'gi');
// //             const matches = lowerChunk.match(regex);
// //             if (matches) {
// //                 score += matches.length * 2;
// //             }
// //         });

// //         // Bonus for exact phrase match
// //         if (lowerChunk.includes(question.toLowerCase())) {
// //             score += 50;
// //         }

// //         // Bonus for question words appearing close together
// //         let wordsInSequence = 0;
// //         for (let i = 0; i < questionWords.length - 1; i++) {
// //             const word1 = questionWords[i];
// //             const word2 = questionWords[i + 1];
// //             if (lowerChunk.includes(word1) && lowerChunk.includes(word2)) {
// //                 const pos1 = lowerChunk.indexOf(word1);
// //                 const pos2 = lowerChunk.indexOf(word2);
// //                 if (Math.abs(pos2 - pos1) < 100) {
// //                     wordsInSequence++;
// //                 }
// //             }
// //         }
// //         score += wordsInSequence * 10;

// //         return { chunk, score };
// //     });

// //     const relevantChunks = scoredChunks
// //         .filter(item => item.score > 0)
// //         .sort((a, b) => b.score - a.score)
// //         .slice(0, topK);

// //     // If no relevant chunks or score too low, return empty
// //     if (relevantChunks.length === 0 || relevantChunks[0].score < 3) {
// //         return [];
// //     }

// //     return relevantChunks.map(item => item.chunk);
// // }

// // /* ===============================
// //    PDF UPLOAD
// // ================================ */
// // app.post("/upload", upload.single("pdf"), async (req, res) => {
// //     try {
// //         if (!req.file) {
// //             return res.status(400).json({ error: "No PDF uploaded" });
// //         }

// //         console.log("📄 PDF uploaded:", req.file.originalname);

// //         const buffer = fs.readFileSync(req.file.path);
// //         const data = await pdf(buffer);

// //         pdfContent = data.text;
// //         pdfChunks = chunkText(pdfContent);

// //         // Extract title (first line or first 100 chars)
// //         const firstLine = pdfContent.split('\n')[0].trim();
// //         pdfTitle = firstLine.substring(0, 100);

// //         // Generate summary
// //         pdfSummary = pdfChunks[0].substring(0, 500);

// //         fs.unlinkSync(req.file.path);
// //         cache.flushAll();

// //         console.log(`✅ PDF processed: ${pdfChunks.length} chunks`);
// //         console.log(`📌 Title: ${pdfTitle}`);

// //         res.json({
// //             message: "PDF indexed successfully",
// //             pages: data.numpages,
// //             chunks: pdfChunks.length,
// //             title: pdfTitle,
// //             summary: pdfSummary.substring(0, 150) + "..."
// //         });

// //     } catch (err) {
// //         console.error("❌ Upload error:", err);
// //         res.status(500).json({ error: err.message });
// //     }
// // });

// // /* ===============================
// //    ASK QUESTION (IMPROVED)
// // ================================ */
// // app.post("/ask", async (req, res) => {
// //     try {
// //         const { question } = req.body;

// //         if (!question) {
// //             return res.status(400).json({ error: "Question required" });
// //         }

// //         if (!pdfChunks.length) {
// //             return res.status(400).json({ error: "Upload a PDF first" });
// //         }

// //         const cacheKey = question.toLowerCase().trim();
// //         const cached = cache.get(cacheKey);
// //         if (cached) {
// //             return res.json({ answer: cached, cached: true });
// //         }

// //         // Find relevant chunks
// //         const relevantChunks = findRelevantChunks(question, pdfChunks, 5);

// //         // Check if question is relevant to PDF
// //         if (relevantChunks.length === 0) {
// //             const fallbackAnswer = `❌ I cannot answer this question as it doesn't appear to be related to the PDF content.

// // 📄 This PDF is about: "${pdfTitle}"

// // ${pdfSummary.substring(0, 200)}...

// // Please ask questions related to this document's topic.`;

// //             cache.set(cacheKey, fallbackAnswer);
// //             return res.json({
// //                 answer: fallbackAnswer,
// //                 cached: false,
// //                 sources: 0,
// //                 irrelevant: true
// //             });
// //         }

// //         const context = relevantChunks.join("\n\n---\n\n");

// //         const completion = await groq.chat.completions.create({
// //             model: "llama-3.3-70b-versatile",
// //             temperature: 0.2,
// //             max_tokens: 1024,
// //             messages: [
// //                 {
// //                     role: "system",
// //                     content: `You are a helpful PDF document assistant. Your job is to answer questions based ONLY on the provided PDF context.

// // STRICT RULES:
// // 1. Answer ONLY using information from the context below
// // 2. If the question is clearly unrelated to the PDF topic, respond:
// //    "❌ This question is not related to the PDF content. This document is about [main topic]. Please ask relevant questions."
// // 3. If the answer is not found in the context, respond:
// //    "❌ The PDF does not contain information to answer this specific question. Please try rephrasing or ask about topics covered in the document."
// // 4. Be specific and reference relevant information from the context
// // 5. Never add external knowledge or make assumptions
// // 6. If you find the answer, provide a clear, detailed response

// // CONTEXT FROM PDF:
// // ${context}`
// //                 },
// //                 {
// //                     role: "user",
// //                     content: question
// //                 }
// //             ]
// //         });

// //         const answer = completion.choices[0].message.content;
// //         cache.set(cacheKey, answer);

// //         res.json({
// //             answer,
// //             cached: false,
// //             sources: relevantChunks.length
// //         });

// //     } catch (err) {
// //         console.error("❌ Ask error:", err);
// //         res.status(500).json({ error: err.message });
// //     }
// // });

// // /* ===============================
// //    ASK QUESTION (STREAMING MODE)
// // ================================ */
// // app.post("/ask-stream", async (req, res) => {
// //     try {
// //         const { question } = req.body;

// //         if (!question) {
// //             return res.status(400).json({ error: "Question required" });
// //         }

// //         if (!pdfChunks.length) {
// //             return res.status(400).json({ error: "Upload a PDF first" });
// //         }

// //         res.setHeader('Content-Type', 'text/event-stream');
// //         res.setHeader('Cache-Control', 'no-cache');
// //         res.setHeader('Connection', 'keep-alive');

// //         const relevantChunks = findRelevantChunks(question, pdfChunks, 5);

// //         if (relevantChunks.length === 0) {
// //             const fallbackAnswer = `❌ I cannot answer this question as it doesn't appear to be related to the PDF content.

// // 📄 This PDF is about: "${pdfTitle}"

// // Please ask questions related to this document's topic.`;

// //             res.write(`data: ${JSON.stringify({ content: fallbackAnswer })}\n\n`);
// //             res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
// //             res.end();
// //             return;
// //         }

// //         const context = relevantChunks.join("\n\n---\n\n");

// //         const stream = await groq.chat.completions.create({
// //             model: "llama-3.3-70b-versatile",
// //             temperature: 0.2,
// //             max_tokens: 1024,
// //             stream: true,
// //             messages: [
// //                 {
// //                     role: "system",
// //                     content: `You are a helpful PDF document assistant. Answer questions based ONLY on the provided context.

// // RULES:
// // 1. Use ONLY the context below
// // 2. If question is unrelated, say: "This question is not related to the PDF content."
// // 3. If answer not found, say: "The PDF does not contain this information."
// // 4. Be specific and detailed when answer is found

// // CONTEXT:
// // ${context}`
// //                 },
// //                 {
// //                     role: "user",
// //                     content: question
// //                 }
// //             ]
// //         });

// //         let fullAnswer = "";

// //         for await (const chunk of stream) {
// //             const content = chunk.choices[0]?.delta?.content || "";
// //             if (content) {
// //                 fullAnswer += content;
// //                 res.write(`data: ${JSON.stringify({ content })}\n\n`);
// //             }
// //         }

// //         const cacheKey = question.toLowerCase().trim();
// //         cache.set(cacheKey, fullAnswer);

// //         res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
// //         res.end();

// //     } catch (err) {
// //         console.error("❌ Stream error:", err);
// //         res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
// //         res.end();
// //     }
// // });

// // /* ===============================
// //    HEALTH CHECK
// // ================================ */
// // app.get("/health", (req, res) => {
// //     res.json({
// //         status: "ok",
// //         chunks: pdfChunks.length,
// //         cacheSize: cache.keys().length,
// //         vectorStoreLoaded: pdfChunks.length > 0,
// //         pdfTitle: pdfTitle || "No PDF loaded"
// //     });
// // });

// // /* ===============================
// //    RESET
// // ================================ */
// // app.post("/reset", (req, res) => {
// //     pdfContent = "";
// //     pdfChunks = [];
// //     pdfSummary = "";
// //     pdfTitle = "";
// //     cache.flushAll();
// //     res.json({ message: "System reset" });
// // });

// // /* ===============================
// //    START SERVER
// // ================================ */
// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => {
// //     console.log(`🚀 PDF RAG Server running on port ${PORT}`);
// //     console.log(`📡 Endpoints:`);
// //     console.log(`   POST /upload - Upload PDF`);
// //     console.log(`   POST /ask - Fast mode`);
// //     console.log(`   POST /ask-stream - Streaming mode`);
// //     console.log(`   POST /reset - Reset system`);
// //     console.log(`   GET /health - Health check`);
// // });


// import express from "express";
// import cors from "cors";
// import fs from "fs";
// import multer from "multer";
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const pdf = require("pdf-parse");

// import Groq from "groq-sdk";
// import NodeCache from "node-cache";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });
// const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

// /* ===============================
//    GROQ CLIENT
// ================================ */
// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY
// });

// let pdfContent = "";
// let pdfChunks = [];
// let pdfSummary = "";
// let pdfTitle = "";

// /* ===============================
//    IMPROVED CHUNK TEXT WITH OVERLAP
// ================================ */
// function chunkText(text, chunkSize = 1500, overlap = 200) {
//     const chunks = [];
//     const sentences = text.split(/(?<=[.!?])\s+/);
//     let current = "";

//     for (let i = 0; i < sentences.length; i++) {
//         const sentence = sentences[i];

//         if ((current + sentence).length < chunkSize) {
//             current += sentence + " ";
//         } else {
//             if (current.trim()) {
//                 chunks.push(current.trim());
//             }

//             // Add overlap from previous chunk
//             const words = current.split(/\s+/);
//             const overlapWords = words.slice(-Math.floor(overlap / 5)).join(" ");
//             current = overlapWords + " " + sentence + " ";
//         }
//     }

//     if (current.trim()) {
//         chunks.push(current.trim());
//     }

//     return chunks.filter(chunk => chunk.length > 100);
// }

// /* ===============================
//    IMPROVED RELEVANCE SEARCH
// ================================ */
// function findRelevantChunks(question, chunks, topK = 5) {
//     const questionWords = question.toLowerCase()
//         .split(/\s+/)
//         .filter(w => w.length > 3);

//     if (questionWords.length === 0) {
//         return chunks.slice(0, topK);
//     }

//     const scoredChunks = chunks.map(chunk => {
//         const lowerChunk = chunk.toLowerCase();
//         let score = 0;

//         // Word frequency scoring
//         questionWords.forEach(word => {
//             const regex = new RegExp(word, 'gi');
//             const matches = lowerChunk.match(regex);
//             if (matches) {
//                 score += matches.length * 2;
//             }
//         });

//         // Bonus for exact phrase match
//         if (lowerChunk.includes(question.toLowerCase())) {
//             score += 50;
//         }

//         // Bonus for question words appearing close together
//         let wordsInSequence = 0;
//         for (let i = 0; i < questionWords.length - 1; i++) {
//             const word1 = questionWords[i];
//             const word2 = questionWords[i + 1];
//             if (lowerChunk.includes(word1) && lowerChunk.includes(word2)) {
//                 const pos1 = lowerChunk.indexOf(word1);
//                 const pos2 = lowerChunk.indexOf(word2);
//                 if (Math.abs(pos2 - pos1) < 100) {
//                     wordsInSequence++;
//                 }
//             }
//         }
//         score += wordsInSequence * 10;

//         return { chunk, score };
//     });

//     const relevantChunks = scoredChunks
//         .filter(item => item.score > 0)
//         .sort((a, b) => b.score - a.score)
//         .slice(0, topK);

//     // If no relevant chunks or score too low, return empty
//     if (relevantChunks.length === 0 || relevantChunks[0].score < 3) {
//         return [];
//     }

//     return relevantChunks.map(item => item.chunk);
// }

// /* ===============================
//    PDF UPLOAD
// ================================ */
// app.post("/upload", upload.single("pdf"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No PDF uploaded" });
//         }

//         console.log("📄 PDF uploaded:", req.file.originalname);

//         const buffer = fs.readFileSync(req.file.path);
//         const data = await pdf(buffer);

//         pdfContent = data.text;
//         pdfChunks = chunkText(pdfContent);

//         // Extract title (first line or first 100 chars)
//         const firstLine = pdfContent.split('\n')[0].trim();
//         pdfTitle = firstLine.substring(0, 100);

//         // Generate summary
//         pdfSummary = pdfChunks[0].substring(0, 500);

//         fs.unlinkSync(req.file.path);
//         cache.flushAll();

//         console.log(`✅ PDF processed: ${pdfChunks.length} chunks`);
//         console.log(`📌 Title: ${pdfTitle}`);

//         res.json({
//             message: "PDF indexed successfully",
//             pages: data.numpages,
//             chunks: pdfChunks.length,
//             title: pdfTitle,
//             summary: pdfSummary.substring(0, 150) + "..."
//         });

//     } catch (err) {
//         console.error("❌ Upload error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// /* ===============================
//    ASK QUESTION (IMPROVED)
// ================================ */
// app.post("/ask", async (req, res) => {
//     try {
//         const { question } = req.body;

//         if (!question) {
//             return res.status(400).json({ error: "Question required" });
//         }

//         if (!pdfChunks.length) {
//             return res.status(400).json({ error: "Upload a PDF first" });
//         }

//         const cacheKey = question.toLowerCase().trim();
//         const cached = cache.get(cacheKey);
//         if (cached) {
//             return res.json({ answer: cached, cached: true });
//         }

//         // Find relevant chunks
//         const relevantChunks = findRelevantChunks(question, pdfChunks, 5);

//         // Check if question is relevant to PDF
//         if (relevantChunks.length === 0) {
//             const fallbackAnswer = `❌ This question is NOT related to the PDF content.

// 📄 What this PDF is about:
// Title: "${pdfTitle}"

// Summary: ${pdfSummary.substring(0, 300)}...

// 💡 Example questions you can ask:
// - "What is the main topic of this document?"
// - "Summarize the key points"
// - "What are the main conclusions?"
// - Questions about specific terms or concepts mentioned above

// Please ask questions related to this document's content! 😊`;

//             cache.set(cacheKey, fallbackAnswer);
//             return res.json({
//                 answer: fallbackAnswer,
//                 cached: false,
//                 sources: 0,
//                 irrelevant: true
//             });
//         }

//         const context = relevantChunks.join("\n\n---\n\n");

//         const completion = await groq.chat.completions.create({
//             model: "llama-3.3-70b-versatile",
//             temperature: 0.2,
//             max_tokens: 1024,
//             messages: [
//                 {
//                     role: "system",
//                     content: `You are a helpful and friendly PDF document assistant. Your job is to answer questions based ONLY on the provided PDF context.

// STRICT RULES:
// 1. Answer ONLY using information from the context below
// 2. If the question is CLEARLY UNRELATED to the PDF topic (e.g., asking about constitution when PDF is about population):
//    - Say: "❌ This question is not related to the PDF content."
//    - Briefly mention what the PDF is actually about
//    - Suggest 2-3 relevant questions the user could ask
// 3. If the answer exists but is NOT in the provided context chunks:
//    - Say: "I couldn't find this specific information in the relevant sections of the PDF."
//    - Suggest the user rephrase or ask a more general question
// 4. If you find the answer:
//    - Provide a CLEAR, DETAILED, and HELPFUL response
//    - Use bullet points or numbered lists when appropriate
//    - Quote relevant parts when needed
// 5. Always be friendly, professional, and helpful
// 6. NEVER add external knowledge or information not in the context

// CONTEXT FROM PDF:
// ${context}`
//                 },
//                 {
//                     role: "user",
//                     content: question
//                 }
//             ]
//         });

//         const answer = completion.choices[0].message.content;
//         cache.set(cacheKey, answer);

//         res.json({
//             answer,
//             cached: false,
//             sources: relevantChunks.length
//         });

//     } catch (err) {
//         console.error("❌ Ask error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// /* ===============================
//    ASK QUESTION (STREAMING MODE)
// ================================ */
// app.post("/ask-stream", async (req, res) => {
//     try {
//         const { question } = req.body;

//         if (!question) {
//             return res.status(400).json({ error: "Question required" });
//         }

//         if (!pdfChunks.length) {
//             return res.status(400).json({ error: "Upload a PDF first" });
//         }

//         res.setHeader('Content-Type', 'text/event-stream');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Connection', 'keep-alive');

//         const relevantChunks = findRelevantChunks(question, pdfChunks, 5);

//         if (relevantChunks.length === 0) {
//             const fallbackAnswer = `❌ This question is NOT related to the PDF content.

// 📄 What this PDF is about:
// Title: "${pdfTitle}"

// 💡 Please ask questions related to this document's content! 😊`;

//             res.write(`data: ${JSON.stringify({ content: fallbackAnswer })}\n\n`);
//             res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
//             res.end();
//             return;
//         }

//         const context = relevantChunks.join("\n\n---\n\n");

//         const stream = await groq.chat.completions.create({
//             model: "llama-3.3-70b-versatile",
//             temperature: 0.2,
//             max_tokens: 1024,
//             stream: true,
//             messages: [
//                 {
//                     role: "system",
//                     content: `You are a helpful PDF document assistant. Answer questions based ONLY on the provided context.

// RULES:
// 1. Use ONLY the context below
// 2. If question is unrelated, say: "This question is not related to the PDF content."
// 3. If answer not found, say: "The PDF does not contain this information."
// 4. Be specific and detailed when answer is found

// CONTEXT:
// ${context}`
//                 },
//                 {
//                     role: "user",
//                     content: question
//                 }
//             ]
//         });

//         let fullAnswer = "";

//         for await (const chunk of stream) {
//             const content = chunk.choices[0]?.delta?.content || "";
//             if (content) {
//                 fullAnswer += content;
//                 res.write(`data: ${JSON.stringify({ content })}\n\n`);
//             }
//         }

//         const cacheKey = question.toLowerCase().trim();
//         cache.set(cacheKey, fullAnswer);

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
//         chunks: pdfChunks.length,
//         cacheSize: cache.keys().length,
//         vectorStoreLoaded: pdfChunks.length > 0,
//         pdfTitle: pdfTitle || "No PDF loaded"
//     });
// });

// /* ===============================
//    RESET
// ================================ */
// app.post("/reset", (req, res) => {
//     pdfContent = "";
//     pdfChunks = [];
//     pdfSummary = "";
//     pdfTitle = "";
//     cache.flushAll();
//     res.json({ message: "System reset" });
// });

// /* ===============================
//    START SERVER
// ================================ */
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`🚀 PDF RAG Server running on port ${PORT}`);
//     console.log(`📡 Endpoints:`);
//     console.log(`   POST /upload - Upload PDF`);
//     console.log(`   POST /ask - Fast mode`);
//     console.log(`   POST /ask-stream - Streaming mode`);
//     console.log(`   POST /reset - Reset system`);
//     console.log(`   GET /health - Health check`);
// });

// import express from "express";
// import cors from "cors";
// import fs from "fs";
// import multer from "multer";
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const pdf = require("pdf-parse");

// import Groq from "groq-sdk";
// import NodeCache from "node-cache";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });
// const cache = new NodeCache({ stdTTL: 600 });

// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY
// });

// let pdfContent = "";
// let pdfChunks = [];

// function chunkText(text, chunkSize = 2000) {
//     const chunks = [];
//     const sentences = text.split(/[.!?]+/);
//     let current = "";

//     for (const s of sentences) {
//         if ((current + s).length < chunkSize) {
//             current += s + ". ";
//         } else {
//             chunks.push(current.trim());
//             current = s + ". ";
//         }
//     }
//     if (current) chunks.push(current.trim());
//     return chunks;
// }

// function findRelevantChunks(question, chunks, topK = 3) {
//     const words = question.toLowerCase().split(/\s+/);

//     return chunks
//         .map(chunk => {
//             let score = 0;
//             const lower = chunk.toLowerCase();
//             words.forEach(w => {
//                 if (w.length > 3 && lower.includes(w)) score++;
//             });
//             return { chunk, score };
//         })
//         .sort((a, b) => b.score - a.score)
//         .slice(0, topK)
//         .map(i => i.chunk);
// }

// app.post("/upload", upload.single("pdf"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No PDF uploaded" });
//         }

//         console.log("📄 PDF uploaded:", req.file.originalname);

//         const buffer = fs.readFileSync(req.file.path);
//         const data = await pdf(buffer);

//         pdfContent = data.text;
//         pdfChunks = chunkText(pdfContent);

//         fs.unlinkSync(req.file.path);
//         cache.flushAll();

//         console.log(`✅ PDF processed: ${pdfChunks.length} chunks`);

//         res.json({
//             message: "PDF indexed successfully",
//             pages: data.numpages,
//             chunks: pdfChunks.length
//         });

//     } catch (err) {
//         console.error("❌ Upload error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// /* ===============================
//    🔥 COMPLETELY UNRESTRICTED ASK
// ================================ */
// app.post("/ask", async (req, res) => {
//     try {
//         const { question } = req.body;

//         if (!question) {
//             return res.status(400).json({ error: "Question required" });
//         }

//         // DON'T use cache for testing
//         // const cacheKey = question.toLowerCase().trim();
//         // const cached = cache.get(cacheKey);
//         // if (cached) {
//         //     return res.json({ answer: cached, cached: true });
//         // }

//         let context = "";

//         // Try to find PDF context
//         if (pdfChunks.length > 0) {
//             const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
//             if (relevantChunks.length > 0) {
//                 context = relevantChunks.join("\n\n");
//             }
//         }

//         // 🔥🔥🔥 ULTRA PERMISSIVE SYSTEM PROMPT 🔥🔥🔥
//         const systemPrompt = context.length > 0
//             ? `You are a knowledgeable AI assistant. I've provided some PDF content below that may be relevant.

// PDF Content:
// ${context}

// Instructions:
// - If the question relates to the PDF content, use that information
// - If the PDF doesn't contain the answer, USE YOUR OWN KNOWLEDGE
// - ALWAYS provide a helpful, detailed answer
// - NEVER say "I don't know" or refuse to answer
// - Be informative and comprehensive
// - Answer as if you're a helpful expert, not limited to any document`

//             : `You are a knowledgeable AI assistant. Answer the question using your comprehensive knowledge. Be detailed, helpful, and informative.`;

//         console.log('🤖 Asking AI with unrestricted prompt...');

//         const completion = await groq.chat.completions.create({
//             model: "llama-3.3-70b-versatile",
//             temperature: 0.5, // Increased for more natural responses
//             max_tokens: 2000,
//             messages: [
//                 {
//                     role: "system",
//                     content: systemPrompt
//                 },
//                 {
//                     role: "user",
//                     content: question
//                 }
//             ]
//         });

//         const answer = completion.choices[0].message.content;

//         // Cache it
//         // cache.set(cacheKey, answer);

//         console.log('✅ Answer generated:', answer.substring(0, 100) + '...');

//         res.json({
//             answer,
//             cached: false,
//             sources: pdfChunks.length > 0 ? 3 : 0
//         });

//     } catch (err) {
//         console.error("❌ Ask error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// app.post("/ask-stream", async (req, res) => {
//     try {
//         const { question } = req.body;

//         if (!question) {
//             return res.status(400).json({ error: "Question required" });
//         }

//         res.setHeader('Content-Type', 'text/event-stream');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Connection', 'keep-alive');

//         let context = "";

//         if (pdfChunks.length > 0) {
//             const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
//             if (relevantChunks.length > 0) {
//                 context = relevantChunks.join("\n\n");
//             }
//         }

//         const systemPrompt = context.length > 0
//             ? `You are a knowledgeable AI assistant. PDF content provided below may be relevant. Use it if helpful, otherwise use your own knowledge. ALWAYS provide helpful answers.

// PDF Content:
// ${context}`
//             : `You are a knowledgeable AI assistant. Answer comprehensively using your knowledge.`;

//         const stream = await groq.chat.completions.create({
//             model: "llama-3.3-70b-versatile",
//             temperature: 0.5,
//             max_tokens: 2000,
//             stream: true,
//             messages: [
//                 {
//                     role: "system",
//                     content: systemPrompt
//                 },
//                 {
//                     role: "user",
//                     content: question
//                 }
//             ]
//         });

//         let fullAnswer = "";

//         for await (const chunk of stream) {
//             const content = chunk.choices[0]?.delta?.content || "";
//             if (content) {
//                 fullAnswer += content;
//                 res.write(`data: ${JSON.stringify({ content })}\n\n`);
//             }
//         }

//         res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
//         res.end();

//     } catch (err) {
//         console.error("❌ Stream error:", err);
//         res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
//         res.end();
//     }
// });

// app.get("/health", (req, res) => {
//     res.json({
//         status: "ok",
//         chunks: pdfChunks.length,
//         cacheSize: cache.keys().length,
//         vectorStoreLoaded: pdfChunks.length > 0
//     });
// });

// app.post("/reset", (req, res) => {
//     pdfContent = "";
//     pdfChunks = [];
//     cache.flushAll();
//     res.json({ message: "System reset" });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`
// ╔══════════════════════════════════════════════════════════╗
// ║                                                          ║
// ║   🔥 GLAMOUR PDF - FULLY UNRESTRICTED MODE 🔥           ║
// ║                                                          ║
// ║   ✅ NO RESTRICTIONS WHATSOEVER                          ║
// ║   ✅ AI WILL ANSWER EVERYTHING                           ║
// ║   ✅ NEVER SAYS "I DON'T KNOW"                           ║
// ║                                                          ║
// ╚══════════════════════════════════════════════════════════╝

// Server: http://localhost:${PORT}
// Status: READY ✅
// Mode: UNRESTRICTED 🔓
//     `);
// });




import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import Groq from "groq-sdk";
import NodeCache from "node-cache";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const cache = new NodeCache({ stdTTL: 600 });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

let pdfContent = "";
let pdfChunks = [];
let pdfMetadata = {};

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

app.post("/upload", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("📄 File uploaded:", req.file.originalname);

        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        let text = "";
        let pages = 1;

        // Process based on file type
        if (fileExtension === 'pdf') {
            // Handle PDF files
            const buffer = fs.readFileSync(req.file.path);
            const data = await pdf(buffer);
            text = data.text;
            pages = data.numpages;
            console.log(`📖 PDF extracted: ${pages} pages`);
        } else if (fileExtension === 'txt') {
            // Handle TXT files
            text = fs.readFileSync(req.file.path, 'utf8');
            pages = Math.ceil(text.length / 2000); // Estimate pages
            console.log(`📝 TXT file loaded: ~${pages} pages`);
        } else {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                error: "Unsupported file type. Please upload PDF or TXT files only."
            });
        }

        pdfContent = text;
        pdfChunks = chunkText(pdfContent);
        pdfMetadata = {
            title: req.file.originalname,
            pages: pages,
            fileType: fileExtension.toUpperCase()
        };

        fs.unlinkSync(req.file.path);
        cache.flushAll();

        console.log(`✅ Document processed: ${pdfChunks.length} chunks`);

        res.json({
            message: `${fileExtension.toUpperCase()} indexed successfully`,
            title: pdfMetadata.title,
            pages: pdfMetadata.pages,
            fileType: pdfMetadata.fileType,
            chunks: pdfChunks.length
        });

    } catch (err) {
        console.error("❌ Upload error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ===============================
   🤖 CHATBOT ASK WITH HISTORY
================================ */
app.post("/ask", async (req, res) => {
    try {
        const { question, history = [] } = req.body;

        if (!question) {
            return res.status(400).json({ error: "Question required" });
        }

        console.log('💬 Question:', question);
        console.log('📜 History length:', history.length);

        let context = "";

        // Try to find PDF context
        if (pdfChunks.length > 0) {
            const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
            if (relevantChunks.length > 0) {
                context = relevantChunks.join("\n\n");
            }
        }

        // Build system prompt with context
        const systemPrompt = context.length > 0
            ? `You are a helpful AI assistant analyzing a PDF document. Here's relevant content from the document:

PDF Content:
${context}

Instructions:
- Answer questions based primarily on the PDF content when relevant
- If the PDF doesn't contain the answer, use your general knowledge
- Be conversational and helpful
- Remember the conversation context
- Provide clear, detailed answers`

            : `You are a helpful AI assistant. Be conversational, clear, and detailed in your responses. Remember the conversation context.`;

        // Build messages array with history
        const messages = [
            {
                role: "system",
                content: systemPrompt
            }
        ];

        // Add conversation history (last 5 pairs max)
        const recentHistory = history.slice(-10); // Last 10 messages (5 pairs)
        messages.push(...recentHistory);

        // Add current question
        messages.push({
            role: "user",
            content: question
        });

        console.log('🤖 Sending to AI with', messages.length, 'messages...');

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2000,
            messages: messages
        });

        const answer = completion.choices[0].message.content;

        console.log('✅ Answer generated:', answer.substring(0, 100) + '...');

        res.json({
            answer,
            sources: pdfChunks.length > 0 ? 3 : 0,
            hasContext: context.length > 0
        });

    } catch (err) {
        console.error("❌ Ask error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ===============================
   🌊 STREAMING WITH HISTORY
================================ */
app.post("/ask-stream", async (req, res) => {
    try {
        const { question, history = [] } = req.body;

        if (!question) {
            return res.status(400).json({ error: "Question required" });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let context = "";

        if (pdfChunks.length > 0) {
            const relevantChunks = findRelevantChunks(question, pdfChunks, 3);
            if (relevantChunks.length > 0) {
                context = relevantChunks.join("\n\n");
            }
        }

        const systemPrompt = context.length > 0
            ? `You are a helpful AI assistant analyzing a PDF document. Here's relevant content:

${context}

Answer based on the document when relevant, otherwise use your knowledge. Be conversational.`
            : `You are a helpful AI assistant. Be conversational and clear.`;

        const messages = [
            {
                role: "system",
                content: systemPrompt
            }
        ];

        // Add history
        const recentHistory = history.slice(-10);
        messages.push(...recentHistory);

        // Add current question
        messages.push({
            role: "user",
            content: question
        });

        const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
            messages: messages
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({
            done: true,
            sources: pdfChunks.length > 0 ? 3 : 0
        })}\n\n`);
        res.end();

    } catch (err) {
        console.error("❌ Stream error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

/* ===============================
   🧹 CLEAR CONVERSATION
================================ */
app.post("/clear-chat", (req, res) => {
    cache.flushAll();
    res.json({ message: "Chat history cleared" });
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        chunks: pdfChunks.length,
        cacheSize: cache.keys().length,
        vectorStoreLoaded: pdfChunks.length > 0,
        pdfLoaded: pdfMetadata.title || null
    });
});

app.get("/pdf-info", (req, res) => {
    res.json({
        loaded: pdfChunks.length > 0,
        metadata: pdfMetadata,
        chunks: pdfChunks.length
    });
});

app.post("/reset", (req, res) => {
    pdfContent = "";
    pdfChunks = [];
    pdfMetadata = {};
    cache.flushAll();
    res.json({ message: "System reset" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🤖 GLAMOUR PDF CHATBOT SERVER                         ║
║                                                          ║
║   ✅ Conversation History Support                        ║
║   ✅ Context-Aware Responses                             ║
║   ✅ Streaming & Normal Mode                             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

Server: http://localhost:${PORT}
Status: READY ✅
Mode: CHATBOT 🤖
    `);
});