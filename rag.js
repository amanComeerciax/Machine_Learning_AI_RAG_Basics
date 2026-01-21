import { ChatOllama } from "@langchain/ollama";
import fs from "fs";

// Load context data
const context = fs.readFileSync("data.txt", "utf-8");

// Create Ollama model
const model = new ChatOllama({
    model: "dolphin-llama3:8b",
    baseUrl: "http://localhost:11434"
});

// Question
const question = "leave kitni hoti hai?";

// Ask model with context (Manual RAG)
const response = await model.invoke(`
You are an assistant.
Answer ONLY using the context below.

Context:
${context}

Question:
${question}
`);

console.log(response.content);
