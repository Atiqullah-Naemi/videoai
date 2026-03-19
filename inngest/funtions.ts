import { db } from "@/lib/db";
import { generateImageForScenes } from "@/lib/image-generator";
import { utapi } from "@/lib/uploadthing-server";
import {
  generatedVideoScript,
  generatedVoiceOver,
} from "@/lib/video-generator";
import { RenderScene } from "@/schemas";
import path from "path";
import { inngest } from "./client";
import fs from "fs";

export const generateVideo = inngest.createFunction(
  { id: "generate-video", retries: 10, timeouts: { finish: "30m" } },
  { event: "video/generate" },
  async ({ event, step }) => {
    const { videoId } = event.data;

    const video = await step.run("fetch-video", async () => {
      return db.video.findUnique({
        where: { id: videoId },
        include: { user: true },
      });
    });
    if (!video) throw new Error("Video not found");

    try {
      await step.run("update-status-script", async () => {
        await db.video.update({
          where: { id: videoId },
          data: { status: "GENERATING_SCRIPT", renderProgress: 10 },
        });
      });

      const productImages = (video.productImages as string[] | null) ?? null;
      const hasImages = !!productImages?.length;

      const scriptData = await step.run("generate-script", async () => {
        return generatedVideoScript(
          video.prompt,
          video.duration,
          productImages ?? undefined,
        );
      });

      await step.run("save-script", async () => {
        await db.video.update({
          where: { id: videoId },
          data: {
            title: scriptData.title,
            script: scriptData.script,
            scenes: scriptData.scenes,
            renderProgress: 30,
          },
        });
      });

      let finalScenes: RenderScene[] = scriptData.scenes;

      if (!hasImages) {
        const generatedImages = await step.run(
          "generate-ai-images",
          async () => {
            const urls = await generateImageForScenes(finalScenes);
            const uploadedUrls = [];

            for (const url of urls) {
              const res = await fetch(url);
              const arrayBuffer = await res.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              const file = new File([buffer], "scene-image.png", {
                type: "image/png",
              });
              const [uploaded] = await utapi.uploadFiles([file]);
              uploadedUrls.push(uploaded.data?.ufsUrl);
            }
            return uploadedUrls;
          },
        );

        finalScenes = finalScenes.map((scene, index) => ({
          ...scene,
          imageUrl: generatedImages[index],
        }));

        await step.run("save-scenes-with-images", async () => {
          await db.video.update({
            where: { id: videoId },
            data: { scenes: finalScenes, renderProgress: 35 },
          });
        });
      }

      // VOICE
      await step.run("update-status-voice", async () => {
        await db.video.update({
          where: { id: videoId },
          data: { status: "GENERATING_VOICE", renderProgress: 40 },
        });
      });

      const audioUrl = await step.run("generate-and-upload-voice", async () => {
        const audioBuffer = await generatedVoiceOver(scriptData.script);

        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const audioPath = path.join(tempDir, `${videoId}-audio.mp3`);
        fs.writeFileSync(audioPath, audioBuffer);

        const audioFile = fs.readFileSync(audioPath);
        const file = new File([audioFile], `${videoId}-audio.mp3`, {
          type: "audio/mpeg",
        });

        const uploaded = await utapi.uploadFiles(file);

        fs.unlinkSync(audioPath);

        if (!uploaded.data?.ufsUrl)
          throw new Error("Failed to upload audio file");
        return uploaded.data.ufsUrl;
      });

      await step.run("save-audio-url", async () => {
        await db.video.update({
          where: { id: videoId },
          data: { voiceUrl: audioUrl, renderProgress: 50 },
        });
      });

      // RENDER
      await step.run("update-status-render", async () => {
        await db.video.update({
          where: { id: videoId },
          data: { status: "RENDERING", renderProgress: 60 },
        });
      });

      const videoResult = await step.run("render-video", async () => {
        const currentVideo = await db.video.findUnique({
          where: { id: videoId },
        });

        if (!currentVideo || !currentVideo.scenes) {
          throw new Error("Scenes not found in database for rendering");
        }

        const scenesToRender =
          (currentVideo.scenes as RenderScene[]) || finalScenes;

        const { renderVideoWithRemotion } =
          await import("@/lib/video-renderer");

        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, `${videoId}.mp4`);

        await renderVideoWithRemotion({
          scenes: scenesToRender,
          audioUrl,
          outputPath,
          videoId,
          onProgress: async (progress: number) => {
            const renderProgress = 60 + Math.round(progress * 0.35);
            await db.video.update({
              where: { id: videoId },
              data: { renderProgress },
            });
          },
        });

        if (!fs.existsSync(outputPath)) {
          throw new Error(
            `Render failed: Output file not found at ${outputPath}`,
          );
        }

        const videoStats = fs.statSync(outputPath);
        if (videoStats.size === 0) {
          throw new Error(
            "Render failed: Generated video file is empty (0 bytes)",
          );
        }

        const videoBuffer = fs.readFileSync(outputPath);
        const videoFile = new File([videoBuffer], `video-${videoId}.mp4`, {
          type: "video/mp4",
        });

        const [uploadedVideo] = await utapi.uploadFiles([videoFile]);

        if (!uploadedVideo.data?.ufsUrl)
          throw new Error("Failed to upload video file");

        fs.unlinkSync(outputPath);

        return {
          videoUrl: uploadedVideo.data.ufsUrl,
          thumbnailUrl: uploadedVideo.data.ufsUrl,
        };
      });

      await step.run("complete", async () => {
        await db.video.update({
          where: { id: videoId },
          data: {
            status: "COMPLETED",
            videoUrl: videoResult.videoUrl,
            thumbnailUrl: videoResult.thumbnailUrl,
            renderProgress: 100,
          },
        });
      });

      return { videoId, ...videoResult };
    } catch (error) {
      await step.run("mark-failed", async () => {
        await db.video.update({
          where: { id: videoId },
          data: {
            status: "FAILED",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          },
        });
      });
      throw error;
    }
  },
);
