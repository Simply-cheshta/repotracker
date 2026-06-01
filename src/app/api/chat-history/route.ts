import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { query, timelineContext, archOverview } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Missing parameter: query" }, { status: 400 });
    }

    const prompt = `
      You are an expert AI Codebase Historian chatbot for an application named RepoBrain.
      Your job is to answer the user's questions about the repository history accurately based ONLY on the provided context.

      System Repository Context:
      - Architecture Overview: ${archOverview || "No high-level overview computed yet."}
      - Chronological Timeline Events: ${JSON.stringify(timelineContext || [])}

      User Question:
      "${query}"

      Rules:
      - Be direct, concise, and helpful. 
      - If explaining a change, reference specific commit SHAs, dates, or authors mentioned in the timeline context.
      - If the context does not contain the answer, politely state that you lack the specific commit data to answer.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ 
      answer: response.text || "I was unable to locate that file change context." 
    });
  } catch (error: any) {
    console.error("Chat engine failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}