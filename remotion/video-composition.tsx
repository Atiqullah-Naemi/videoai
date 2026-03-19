import { cn } from "@/lib/utils";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

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

interface VideoCompositionProps {
  scenes?: Scene[];
  audioUrl?: string;
}

const FilmGrain = ({ intensity = 0.03 }: { intensity?: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill className={cn("mix-blend-overlay", intensity)}>
      <svg width={width} height={height}>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.8}
            numOctaves={4}
            seed={frame}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette = ({ intensity = 0.3 }: { intensity?: number }) => {
  return (
    <AbsoluteFill
      className={`pointer-events-none bg-[radial-gradient(circle_at_center, transparent_0%, transparent_50&, rbga(0, 0, 0, ${intensity}_100%))]`}
    />
  );
};

const ColorGrade = ({
  style = "cinematic",
}: {
  style?: "warm" | "cool" | "cinematic" | "vibrant";
}) => {
  const overlays = {
    warm: "linear-gradient(135deg, rgba(255,150,100,0.08) 0%, rgba(255,200,150,0.05) 100%)",
    cool: "linear-gradient(135deg, rgba(100,150,255,0.08) 0%, rgba(150,200,255,0.05) 100%)",
    cinematic:
      "linear-gradient(135deg, rgba(0,50,100,0.1) 0%, rgba(100,50,0,0.08) 100%)",
    vibrant:
      "linear-gradient(135deg, rgba(255,100,200,0.06) 0%, rgba(100,200,255,0.06) 100%)",
  };

  return (
    <AbsoluteFill
      className={cn("mix-blend-overlay pointer-events-none", overlays[style])}
    />
  );
};

const getKenBurnsStyle = (sceneIndex: number, progress: number) => {
  const zoomPatterns = [
    { start: 1, end: 1.15 },
    { start: 1.1, end: 1 },
    { start: 1, end: 1.12 },
  ];
  const zoomPattern = zoomPatterns[sceneIndex % zoomPatterns.length];
  const scale =
    zoomPattern.start + (zoomPattern.end - zoomPattern.start) * progress;
  const panPatterns = [
    { x: -30, y: -20 },
    { x: 30, y: -15 },
    { x: -25, y: 15 },
    { x: 20, y: -25 },
  ];
  const panPattern = panPatterns[sceneIndex % panPatterns.length];
  const translateX = panPattern.x * progress;
  const translateY = panPattern.y * progress;

  return { scale, translateX, translateY };
};

const AnimatedImage = ({
  imageUrl,
  sceneIndex,
}: {
  imageUrl: string;
  sceneIndex: number;
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  const { scale, translateX, translateY } = getKenBurnsStyle(
    sceneIndex,
    progress,
  );

  return (
    <AbsoluteFill>
      <div
        className="w-full h-full origin-center"
        style={{
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        }}
      >
        <Img src={imageUrl} className="w-full h-full object-cover" />
      </div>
    </AbsoluteFill>
  );
};

const AnimatedText = ({
  text,
  description,
  textColor,
}: {
  text: string;
  description: string;
  textColor: string;
  hasImage: boolean;
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const yOffset = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${yOffset}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        textAlign: "center",
        zIndex: 10,
      }}
    >
      {text && (
        <h1
          style={{
            color: textColor || "white",
            fontSize: 90,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 24,
            textShadow: "0 4px 24px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)",
            lineHeight: 1.1,
            maxWidth: 1600,
            fontFamily: "sans-serif",
          }}
        >
          {text}
        </h1>
      )}
      <p
        style={{
          color: textColor || "white",
          fontSize: 52,
          fontWeight: 600,
          textAlign: "center",
          maxWidth: 1400,
          textShadow: "0 2px 16px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)",
          lineHeight: 1.4,
          fontFamily: "sans-serif",
        }}
      >
        {description}
      </p>
    </AbsoluteFill>
  );
};

const SceneComponent = ({
  scene,
  sceneIndex,
}: {
  scene: Scene;
  sceneIndex: number;
}) => {
  return (
    <AbsoluteFill>
      <AnimatedImage
        imageUrl={scene.imageUrl as string}
        sceneIndex={sceneIndex}
      />
      <ColorGrade style="cinematic" />
      <Vignette intensity={0.2} />
      <FilmGrain intensity={0.25} />
      <AnimatedText
        text={scene.text as string}
        description={scene.description}
        textColor={scene.textColor as string}
        hasImage={!!scene.imageUrl}
      />
    </AbsoluteFill>
  );
};

export default function VideoComposition({
  scenes,
  audioUrl,
}: VideoCompositionProps) {
  const { fps } = useVideoConfig();

  if (!scenes || scenes.length === 0) {
    <AbsoluteFill className="bg-black justify-center items-center">
      <h1 className="text-white text-5xl">No scenes provided</h1>
    </AbsoluteFill>;
  }

  const sceneTimings = scenes?.map((scene: Scene, index: number) => {
    const prevScenes = scenes.slice(0, index);
    const startFrame = prevScenes.reduce(
      (acc, prevScene) => acc + Math.round(prevScene.duration * fps),
      0,
    );

    const durationInFrames = Math.round(scene.duration * fps);

    return {
      startFrame,
      durationInFrames,
      scene,
      sceneIndex: index,
    };
  });

  return (
    <AbsoluteFill className="bg-black">
      {sceneTimings?.map(
        ({ startFrame, durationInFrames, scene, sceneIndex }) => {
          return (
            <Sequence
              key={scene.id}
              from={startFrame}
              durationInFrames={durationInFrames}
            >
              <SceneComponent scene={scene} sceneIndex={sceneIndex} />
            </Sequence>
          );
        },
      )}

      {audioUrl && <Html5Audio src={audioUrl} />}
    </AbsoluteFill>
  );
}
