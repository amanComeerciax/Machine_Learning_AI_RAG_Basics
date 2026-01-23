// import { ChatOllama } from "@langchain/ollama";
// import fs from "fs";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// // 1️⃣ Load PDF
// const data = new Uint8Array(fs.readFileSync("file.pdf"));
// const pdf = await pdfjsLib.getDocument({ data }).promise;

// // 2️⃣ Extract text from all pages
// let context = "";

// for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const content = await page.getTextContent();
//     const text = content.items.map(item => item.str).join(" ");
//     context += text + "\n";
// }

// context = context.toLowerCase();

// // 3️⃣ Question
// const question = "what is Instructions:".toLowerCase();

// // 4️⃣ HARD GUARD (anti-hallucination)
// const keywords = ["instructions"];
// const found = keywords.some(word => context.includes(word));

// if (!found) {
//     console.log("The provided context does not contain the answer to this question.");
//     process.exit(0);
// }

// // 5️⃣ Ollama model
// const model = new ChatOllama({
//     model: "dolphin-llama3:8b",
//     baseUrl: "http://localhost:11434"
// });

// // 6️⃣ Ask model with strict context
// const response = await model.invoke(`
// Answer ONLY using the context below.
// If the answer is not in the context, say you do not know.

// Context:
// ${context}

// Question:
// ${question}
// `);

// console.log(response.content);


import { ChatOllama } from "@langchain/ollama";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/* ================================
   1️⃣ LOAD & READ PDF
================================ */
let context = "";

try {
    const data = new Uint8Array(fs.readFileSync("file.pdf"));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(" ");
        context += text + "\n";
    }
} catch (err) {
    console.error("❌ PDF could not be read as text.");
    console.error("Reason:", err.message);
    process.exit(1);
}

context = context.toLowerCase();

/* ================================
   2️⃣ USER QUESTION
================================ */
const question = "What is subject name?".toLowerCase();

/* ================================
   3️⃣ AUTOMATIC KEYWORD GUARD
================================ */
const keywords = question
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .map(w => w.toLowerCase())
    .filter(w => w.length > 3);

const matchedKeywords = keywords.filter(word => context.includes(word));

if (matchedKeywords.length === 0) {
    console.log("The provided context does not contain the answer to this question.");
    process.exit(0);
}

/* ================================
   4️⃣ OLLAMA MODEL
================================ */
const model = new ChatOllama({
    model: "dolphin-llama3:8b",
    baseUrl: "http://localhost:11434"
});

/* ================================
   5️⃣ ASK LLM WITH CONTEXT (RAG)
================================ */
const response = await model.invoke(`
You are a strict question-answering system.

Rules:
- Answer ONLY using the provided context.
- If the answer is not in the context, say you do not know.

Context:
${context}

Question:
${question}
`);

console.log(response.content);
