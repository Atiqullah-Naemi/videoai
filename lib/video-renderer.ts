import path from "path";

interface Scene {
  id: string;
  duration: number;
  description: string;
  text?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  animation?: "fade-in" | "slide-up" | "zoom-in" | "none";
}

interface RenderParams {
  scenes: Scene[];
  audioUrl: string;
  outputPath: string;
  videoId: string;
  onProgress?: (progress: number) => void;
}

let cachedBundleUrl: string | null = null;

export async function renderVideoWithRemotion(params: RenderParams) {
  const { scenes, audioUrl, outputPath, onProgress } = params;

  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  const entryPoint = path.join(process.cwd(), "remotion/index.ts");

  if (!cachedBundleUrl) {
    cachedBundleUrl = await bundle({
      entryPoint,
      webpackOverride: (config) => {
        config.resolve = {
          ...config.resolve,
          extensions: [".tsx", ".ts", ".jsx", ".js"],
          alias: {
            ...(config.resolve?.alias ?? {}),
            "@": process.cwd(),
          },
        };

        return config;
      },
    });
  }

  const inputProps = {
    scenes,
    audioUrl,
  };

  const composition = await selectComposition({
    serveUrl: cachedBundleUrl,
    id: "video-composition",
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl: cachedBundleUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    crf: 16,
    pixelFormat: "yuv420p",
    audioBitrate: "320k",
    enforceAudioTrack: true,
    chromiumOptions: {
      headless: true,
      gl: "angle",
    },
    scale: 1.5,
    imageFormat: "jpeg",
    jpegQuality: 95,
    onProgress: ({ progress }) => {
      const progressPercent = Math.round(progress * 100);

      if (onProgress) {
        onProgress(progressPercent);
      }
    },
  });

  return outputPath;
}
