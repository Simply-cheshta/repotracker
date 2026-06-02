import { GoogleGenAI } from "@google/genai";
import { CommitData } from "./github";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DeveloperProfile {
  name: string;
  commitCount: number;
  componentsOwned: string[];
  architecturalInfluence: string;
  averageImpactScore: number;
}

export interface AdvancedEvolutionPayload {
  timeline: Array<{
    sha: string;
    title: string;
    explanation: string;
    impactScore: number;
    filesTouched: string[];
  }>;
  architectureSummary: string;
  developerProfiles: DeveloperProfile[];
}

export async function generateAdvancedIntelligence(history: CommitData[]): Promise<AdvancedEvolutionPayload> {
  // 1. Calculate Core Developer Metrics Algorithmically First
  const devMap: Record<string, { commits: number; scores: number[]; files: Set<string> }> = {};
  
  history.forEach(c => {
    if (!devMap[c.author]) {
      devMap[c.author] = { commits: 0, scores: [], files: new Set() };
    }
    devMap[c.author].commits += 1;
    c.filesChanged.forEach(f => devMap[c.author].files.add(f.filename));
  });

  const digest = history.map(c => {
    const fileSummary = c.filesChanged.map(f => `File: ${f.filename} (+${f.additions} -${f.deletions})`).join("\n");
    return `Commit: ${c.sha}\nAuthor: ${c.author}\nMessage: ${c.message}\nFiles:\n${fileSummary}`;
  }).join("\n\n===\n\n");

  const prompt = `
    You are a Lead Software Architect conducting a forensic code audit. Process this Git commit history log.
    Provide a valid, clean JSON response matching this exact TypeScript structure:
    {
      "timelineNodes": Array<{ "sha": string, "title": string, "explanation": string, "impactScore": number, "filesTouched": string[] }>,
      "architectureSummary": string,
      "devInfluences": Array<{ "name": string, "architecturalInfluenceSummary": string, "scoreEstimation": number, "primaryComponents": string[] }>
    }

    Rules:
    - "filesTouched": Must extract an array of file path strings affected by this commit node.
    - "architecturalInfluenceSummary": A crisp phrase summarizing what major structural components this specific engineer introduced or refactored (e.g., "Introduced JWT Core, Setup Payment Gateways").
    - Return PURE raw JSON text strings only. Do NOT wrap in markdown code blocks like \`\`\`json.

    Git History Logs:
    ${digest}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const parsedAI = JSON.parse(response.text || "{}");

  // 2. Synthesize Algorithmic Data with AI Context to build Developer Profiles
  const developerProfiles: DeveloperProfile[] = Object.keys(devMap).map(name => {
    const aiDev = parsedAI.devInfluences?.find((d: any) => d.name.toLowerCase() === name.toLowerCase());
    return {
      name,
      commitCount: devMap[name].commits,
      componentsOwned: aiDev?.primaryComponents || Array.from(devMap[name].files).slice(0, 3),
      architecturalInfluence: aiDev?.architecturalInfluenceSummary || "Contributed baseline feature enhancements.",
      averageImpactScore: aiDev?.scoreEstimation || 5
    };
  });

  return {
    timeline: parsedAI.timelineNodes || [],
    architectureSummary: parsedAI.architectureSummary || "",
    developerProfiles
  };
}