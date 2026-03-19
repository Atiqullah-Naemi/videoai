import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { VideoList } from "@/components/video-list";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Video } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/sign-in");

  const videos = await db.video.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="py-10 w-full flex justify-center items-center flex-wrap">
      {videos.length > 0 ? (
        <VideoList videos={videos} username={session.user.name} />
      ) : (
        <div className="h-screen w-7xl mx-auto flex items-center justify-center">
          <Card className="border-none shadow-lg w-full h-fit p-20 flex items-center justify-center ring-0">
            <CardTitle>No videos yet</CardTitle>
            <Link href="/dashboard/generate">
              <Button className="flex gap-4 items-center">
                <Video />
                Create your first video
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
