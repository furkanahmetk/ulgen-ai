import { ChatOpenAI } from "@langchain/openai";

const MODEL = process.env.OPENROUTER_MODEL || "google/gemma-3-27b-it:free";

export function getLLM(opts: { temperature?: number } = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY tanımlı değil (.env dosyasını kontrol et)");
  }

  return new ChatOpenAI({
    modelName: MODEL,
    temperature: opts.temperature ?? 0.2,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://sentinel-ai.example.com",
        "X-Title": "Sentinel AI",
      },
    },
  });
}
