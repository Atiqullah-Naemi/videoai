import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DownloadIcon, MoveLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export default async function VideoDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/sign-in");

  const video = await db.video.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!video) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="flex items-center gap-4 cursor-pointer"
          >
            <MoveLeft />
            Back to dashboard
          </Button>
        </Link>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-3xl font-semibold mb-2"> {video.title} </h3>
          <p className="font-medium"> {video.description} </p>
          <div className="flex flex-col gap-2 justify-start items-center w-full">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-900">
                  Status: {video.status}
                </span>
                <span className="text-sm text-gray-900">
                  Duration: {video.duration}s
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-900">
                  Created at: {new Date(video.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-900">
                  Progess: {video.renderProgress}s
                </span>
              </div>
            </div>
          </div>

          {video.status === "COMPLETED" && video.videoUrl && (
            <Suspense fallback="loading...">
              <div className="p-8 mb-6">
                <video
                  controls
                  className="w-full rounded-lg"
                  preload="metadata"
                  playsInline
                >
                  <source src={video.videoUrl} type="video/mp4" />
                </video>
                <Link href={video.videoUrl} download className="mt-6 block">
                  <Button className="flex gap-4 items-center">
                    <DownloadIcon /> Download video
                  </Button>
                </Link>
              </div>
            </Suspense>
          )}

          {video.status === "FAILED" && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
              <p className="text-rose-800 font-semibold">Generation failed</p>
              <p className="text-rose-700 text-sm">
                {video.errorMessage || "An unknown error occured"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
