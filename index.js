import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
    model: "dolphin-llama3:8b",
    baseUrl: "http://localhost:11434"
});

const res = await model.invoke(
    "LangChain ko ek example se samjhao"
);

console.log(res.content);
