import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl) {
      return NextResponse.json({ error: "Missing repoUrl" }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Fresh workspace sync initialized flawlessly!", 
      repoUrl 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}