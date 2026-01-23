// import fs from "fs";
// import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { Document } from "@langchain/core/documents";


// // 1️⃣ Read data
// const text = fs.readFileSync("data.txt", "utf-8");

// // 2️⃣ Create documents (chunking simple)
// const docs = text
//     .split("\n\n")
//     .map(chunk =>
//         new Document({ pageContent: chunk })
//     );

// // 3️⃣ Embeddings
// const embeddings = new OllamaEmbeddings({
//     model: "nomic-embed-text" // FAST & FREE
// });

// // 4️⃣ Vector store
// const vectorStore = await MemoryVectorStore.fromDocuments(
//     docs,
//     embeddings
// );
// // 5️⃣ Retriever (similarity search)
// const retriever = vectorStore.asRetriever(2);

// // 6️⃣ User question
// const question = "who is aman gupta?";

// // 7️⃣ Retrieve relevant chunks
// const relevantDocs = await retriever.getRelevantDocuments(question);

// // 8️⃣ Combine context
// const context = relevantDocs.map(d => d.pageContent).join("\n");

// // 9️⃣ LLM
// const model = new ChatOllama({
//     model: "dolphin-llama3:8b",
//     baseUrl: "http://localhost:11434"
// });


// const response = await model.invoke(`
// You are a STRICT question-answering system.

// RULES:
// - You MUST answer ONLY from the provided context.
// - Do NOT use any external or prior knowledge.
// - If the answer is NOT present in the context, reply EXACTLY with:
//   "The provided context does not contain the answer."

// Context:
// ${context}

// Question:
// ${question}
// `);


// console.log("\n📌 Answer:\n");
// console.log(response.content);






import fs from "fs";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

/* ===============================
   1️⃣ READ SOURCE DATA
================================ */
const text = fs.readFileSync("data.txt", "utf-8");

/* ===============================
   2️⃣ CHUNKING (Simple)
================================ */
const docs = text
    .split("\n\n")
    .map(chunk => new Document({ pageContent: chunk }));

console.log("\n📦 ALL CHUNKS (INPUT TO RAG):\n");
docs.forEach((doc, i) => {
    console.log(`--- Chunk ${i + 1} ---`);
    console.log(doc.pageContent);
});

/* ===============================
   3️⃣ EMBEDDINGS MODEL
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
   5️⃣ USER QUESTION
================================ */
const question = "What is  gupta?";

console.log("\n❓ QUESTION:");
console.log(question);

/* ===============================
   6️⃣ DEBUG: QUESTION VECTOR
================================ */
const questionVector = await embeddings.embedQuery(question);

console.log("\n🧠 QUESTION VECTOR INFO:");
console.log("Vector length:", questionVector.length);
console.log("Vector sample:", questionVector.slice(0, 10));

/* ===============================
   7️⃣ RETRIEVER (SIMILARITY SEARCH)
================================ */
const retriever = vectorStore.asRetriever(2);
const relevantDocs = await retriever.getRelevantDocuments(question);

/* ===============================
   8️⃣ SHOW RETRIEVED CHUNKS
================================ */
console.log("\n🔍 RETRIEVED CHUNKS (USED AS CONTEXT):\n");

relevantDocs.forEach((doc, i) => {
    console.log(`--- Match ${i + 1} ---`);
    console.log(doc.pageContent);
});

/* ===============================
   9️⃣ BUILD CONTEXT
================================ */
const context = relevantDocs.map(d => d.pageContent).join("\n");

/* SAFETY CHECK */
if (!context || context.trim().length < 20) {
    console.log("\n❌ The provided context does not contain the answer.");
    process.exit(0);
}

/* ===============================
   🔟 LLM (CHAT MODEL)
================================ */
const model = new ChatOllama({
    model: "dolphin-llama3:8b",
    baseUrl: "http://localhost:11434"
});

/* ===============================
   1️⃣1️⃣ STRICT RAG PROMPT
================================ */
const response = await model.invoke(`
You are a STRICT question-answering system.

RULES:
- Answer ONLY from the provided context.
- Do NOT use any external or prior knowledge.
- If the answer is NOT present in the context, reply EXACTLY with:
  "The provided context does not contain the answer."

Context:
${context}

Question:
${question}
`);

console.log("\n📌 FINAL ANSWER:\n");
console.log(response.content);
