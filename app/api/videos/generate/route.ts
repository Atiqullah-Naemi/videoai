import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, prompt, duration, productImages } = await req.json();

  const video = await db.video.create({
    data: {
      userId: session.user.id,
      title,
      prompt,
      duration,
      status: "PENDING",
      productImages: productImages || [],
    },
  });

  await inngest.send({
    name: "video/generate",
    data: { videoId: video.id },
  });

  return NextResponse.json({ video });
}
