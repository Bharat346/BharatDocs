// lib/rag/groq.js
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateCompletion(messages, options = {}) {
  const completion = await groq.chat.completions.create({
    messages,
    model: options.model || "llama-3.3-70b-versatile",
    temperature: options.temperature ?? 0.7,
    stream: false,
    ...options,
  });

  return completion.choices[0]?.message?.content || "";
}

// Support streaming if needed later
export async function getStreamingCompletion(messages, options = {}) {
  return groq.chat.completions.create({
    messages,
    model: options.model || "llama-3.3-70b-versatile",
    stream: true,
    ...options,
  });
}
