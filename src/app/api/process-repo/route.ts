import { NextResponse } from "next/server";
import { fetchCommitHistory } from "@/lib/github";
import { generateEvolutionIntelligence } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json();
    if (!repoUrl) return NextResponse.json({ error: "Missing parameter: repoUrl" }, { status: 400 });

    const historyData = await fetchCommitHistory(repoUrl);
    const analysisPayload = await generateEvolutionIntelligence(historyData);

    return NextResponse.json({
      status: "success",
      timeline: analysisPayload.timeline,
      architectureSummary: analysisPayload.architectureSummary
    });
  } catch (error: any) {
    console.error("Pipeline breakdown:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}