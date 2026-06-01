import { GoogleGenAI } from "@google/genai";
import { CommitData } from "./github";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface EvolutionPayload {
  timeline: Array<{
    sha: string;
    title: string;
    explanation: string;
    impactScore: number;
  }>;
  architectureSummary: string;
}

export async function generateEvolutionIntelligence(history: CommitData[]): Promise<EvolutionPayload> {
  const digest = history.map(c => {
    const fileSummary = c.filesChanged.map(f => `File: ${f.filename} (+${f.additions} -${f.deletions})`).join("\n");
    return `Commit: ${c.sha}\nAuthor: ${c.author}\nMessage: ${c.message}\nFiles:\n${fileSummary}`;
  }).join("\n\n===\n\n");

  const prompt = `
    You are an expert Software Architect reviewing repository updates. Analyze this commit history.
    Provide a valid, clean JSON response that matches this exact structural interface shape:
    {
      "timeline": Array<{ "sha": string, "title": string, "explanation": string, "impactScore": number }>,
      "architectureSummary": string
    }

    Rules:
    - impactScore: Rank from 1 (minor text/style fix) to 10 (massive architectural shift/breaking change).
    - Return ONLY raw, valid JSON text. Do NOT wrap your output in markdown code blocks like \`\`\`json.

    Git History Logs:
    ${digest}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return JSON.parse(response.text || "{}");
}