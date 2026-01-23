import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

/* ===============================
   1️⃣ LOAD PDF (pdfjs)
================================ */
const pdfBuffer = new Uint8Array(fs.readFileSync("file.pdf"));

const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
const pdf = await loadingTask.promise;

let fullText = "";

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(" ");
    fullText += pageText + "\n\n";
}

console.log("\n📄 PDF PAGES:", pdf.numPages);
console.log("📄 TEXT LENGTH:", fullText.length);

/* ===============================
   2️⃣ CHUNKING
================================ */
const chunks = fullText
    .split(/\n{2,}/)
    .map(t => t.trim())
    .filter(t => t.length > 80);

const docs = chunks.map(
    chunk => new Document({ pageContent: chunk })
);

console.log("\n📦 TOTAL CHUNKS:", docs.length);

/* ===============================
   3️⃣ EMBEDDINGS
================================ */
const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text"
});

/* ===============================
   4️⃣ VECTOR STORE
================================ */
const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    embeddings
);

/* ===============================
   5️⃣ QUESTION
================================ */
const question = "What is subject name?";
console.log("\n❓ QUESTION:", question);

/* ===============================
   6️⃣ RETRIEVE CONTEXT
================================ */
const retriever = vectorStore.asRetriever(3);
const relevantDocs = await retriever.getRelevantDocuments(question);

console.log("\n🔍 RETRIEVED CHUNKS:\n");
relevantDocs.forEach((doc, i) => {
    console.log(`--- Match ${i + 1} ---`);
    console.log(doc.pageContent.slice(0, 300));
});

/* ===============================
   7️⃣ BUILD CONTEXT
================================ */
const context = relevantDocs.map(d => d.pageContent).join("\n");

if (!context || context.length < 40) {
    console.log("The provided context does not contain the answer.");
    process.exit(0);
}

/* ===============================
   8️⃣ LLM
================================ */
const model = new ChatOllama({
    model: "dolphin-llama3:8b",
    baseUrl: "http://localhost:11434"
});

/* ===============================
   9️⃣ STRICT RAG PROMPT
================================ */
const response = await model.invoke(`
You are a STRICT question-answering system.

RULES:
- Answer ONLY using the provided context.
- Do NOT use external or prior knowledge.
- If the answer is NOT present in the context, reply EXACTLY:
  "The provided context does not contain the answer."

Context:
${context}

Question:
${question}
`);

console.log("\n📌 FINAL ANSWER:\n");
console.log(response.content);
