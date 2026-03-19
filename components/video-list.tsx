import Link from "next/link";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Video } from "@/lib/generated/prisma/client";
import { ArrowRight } from "lucide-react";

interface VideoProps {
  videos: Video[];
  username: string;
}

export const VideoList = ({ videos, username }: VideoProps) => {
  return (
    <div className="max-w-7xl w-full grid grid-cols-3 gap-4">
      {videos.map((video) => {
        return (
          <Card key={video.id} className="bg-neutral-100 shadow-lg w-full pt-0">
            <video
              src={video.videoUrl as string}
              controls
              className="w-full rounded-lg"
            />

            <div className="flex flex-col gap-4 p-2">
              <h3 className="font-medium"> {video.title} </h3>
              <div className="flex gap-4">
                <span className="text-sm text-gray-600">
                  Created on: {new Date(video.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-600">By: {username}</span>
              </div>
              <div className="text-sm">{video.description}</div>
            </div>

            <div className="flex justify-end w-full py-2 px-2">
              <Link href={`/dashboard/videos/${video.id}`}>
                <Button className="flex items-center gap-3">
                  Watch full video
                  <ArrowRight />
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
