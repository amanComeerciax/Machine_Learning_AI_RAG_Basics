// import axios from "axios";
// import * as cheerio from "cheerio";

// import { ChatOllama } from "@langchain/ollama";

// // 1️⃣ Fetch website HTML
// const url = "https://httpbin.org/html";
// const { data: html } = await axios.get(url);

// // 2️⃣ Extract text from HTML
// const $ = cheerio.load(html);
// const context = $("body").text().toLowerCase();

// // 3️⃣ User question
// const question = "what is this page about?".toLowerCase();

// // 4️⃣ Automatic keyword guard
// const keywords = question
//     .replace(/[^\w\s]/g, "")
//     .split(" ")
//     .filter(w => w.length > 3);

// const found = keywords.some(word => context.includes(word));

// if (!found) {
//     console.log("Answer not found on this website.");
//     process.exit(0);
// }

// // 5️⃣ Ollama model
// const model = new ChatOllama({
//     model: "dolphin-llama3:8b",
//     baseUrl: "http://localhost:11434"
// });

// // 6️⃣ Ask AI
// const response = await model.invoke(`
// Answer ONLY using the website content below.

// Website Content:
// ${context}

// Question:
// ${question}
// `);

// console.log(response.content);

import axios from "axios";
import * as cheerio from "cheerio";
import { ChatOllama } from "@langchain/ollama";

console.log("🔹 Step 1: Starting program");

// 1️⃣ Fetch website (with timeout)
const url = "https://httpbin.org/html";
console.log("🔹 Step 2: Fetching website...");

const { data: html } = await axios.get(url, {
    timeout: 5000, // ⏱️ VERY IMPORTANT
});

console.log("✅ Website fetched");

// 2️⃣ Extract text
console.log("🔹 Step 3: Extracting text");
const $ = cheerio.load(html);
const context = $("body").text().toLowerCase();

console.log("Text length:", context.length);

// 3️⃣ Question
const question = "what is this page about?".toLowerCase();
console.log("🔹 Step 4: Question set");

// 4️⃣ Keyword guard
const keywords = question
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(w => w.length > 3);

const found = keywords.some(word => context.includes(word));
console.log("Keywords found:", found);

if (!found) {
    console.log("❌ Answer not found on this website.");
    process.exit(0);
}

// 5️⃣ Ollama
console.log("🔹 Step 5: Calling Ollama");

const model = new ChatOllama({
    model: "dolphin-llama3:8b",
    baseUrl: "http://localhost:11434"
});

// 6️⃣ Invoke model
const response = await model.invoke(`
Answer ONLY using the website content below.

Website Content:
${context}

Question:
${question}
`);

console.log("✅ Ollama responded");
console.log(response.content);
