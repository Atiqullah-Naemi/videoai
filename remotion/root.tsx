import { Composition } from "remotion";
import VideoComposition from "./video-composition";

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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="video-composition"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: [
            {
              id: "default-scene",
              duration: 5,
              description: "Default scene",
              text: "Hello world",
              backgroundColor: "#1a1a1a",
              textColor: "#ffffff",
              animation: "fade-in" as const,
            },
          ],
          audioUrl: undefined,
        }}
        calculateMetadata={({ props }) => {
          const typeProps = props as VideoCompositionProps;
          const scenes = typeProps.scenes || [];
          const totalSeconds = scenes.reduce(
            (acc, scene) => acc + scene.duration,
            0,
          );

          return {
            durationInFrames: Math.max(Math.round(totalSeconds * 30), 30),
          };
        }}
      />
    </>
  );
};
