import { auth } from "@/lib/auth";
import { improvePrompt } from "@/lib/video-generator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  const improvedPrompt = await improvePrompt(prompt);

  return NextResponse.json({ improvedPrompt });
}
