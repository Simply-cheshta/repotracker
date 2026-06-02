import { NextResponse } from "next/server";
import { fetchCommitHistory } from "@/lib/github";
import { generateAdvancedIntelligence } from "@/lib/ai"; 

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json();
    if (!repoUrl) return NextResponse.json({ error: "Missing parameter: repoUrl" }, { status: 400 });

    const historyData = await fetchCommitHistory(repoUrl);
    const complexAnalytics = await generateAdvancedIntelligence(historyData);

    return NextResponse.json({
      status: "success",
      timeline: complexAnalytics.timeline,
      architectureSummary: complexAnalytics.architectureSummary,
      developerProfiles: complexAnalytics.developerProfiles 
    });
  } catch (error: any) {
    console.error("Pipeline breakdown:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}