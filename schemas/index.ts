import { z } from "zod";

export const BeatSchema = z.object({
  beatId: z.string(),
  startFrame: z.number(),
  durationFrames: z.number(),
  type: z.enum([
    "product_closeup",
    "product_angle",
    "feature_text",
    "testimonial",
    "before_after",
    "how_it_works",
    "offer",
    "cta",
    "broll",
    "text_only",
  ]),
  visual: z.string(),
  motion: z.enum([
    "zoom-in",
    "slide-left",
    "whip-pan",
    "parallax",
    "pop",
    "shake",
    "none",
  ]),
  overlayText: z.string().optional(),
  emphasisWords: z.array(z.string()).optional(),
});

export const TextOverlaySchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  style: z.enum(["headline", "caption", "badge"]),
});

export const LLMSceneSchema = z.object({
  id: z.string(),
  durationSeconds: z.number(),
  durationFrames: z.number(),
  goal: z.string(),
  voiceover: z.string(),
  musicMood: z.string().optional(),
  background: z.object({ color: z.string().optional() }),
  textStyle: z.object({
    color: z.string().optional(),
    accentColor: z.string().optional(),
  }),
  animation: z.enum(["fade-in", "slide-up", "zoom-in", "none"]),
  textOverlays: z.array(TextOverlaySchema),
  visualElements: z.array(z.string()),
  beats: z.array(BeatSchema),

  // we attach later
  imageUrl: z.string().optional(),
});

export const VideoPlanSchema = z.object({
  meta: z.object({
    durationSeconds: z.number(),
    fps: z.number(),
    totalFrames: z.number(),
    numberOfScenes: z.number(),
    visualPacing: z.object({
      minCutsPerSecond: z.number(),
      targetCutsPerSecond: z.number(),
      maxBeatSeconds: z.number(),
      minBeatSeconds: z.number(),
    }),
  }),
  styleGuide: z.object({
    brandVibe: z.string(),
    fontSuggestions: z.array(z.string()),
    colorPalette: z.array(
      z.object({ bg: z.string(), text: z.string(), accent: z.string() }),
    ),
    motionRules: z.array(z.string()),
  }),
  scenes: z.array(LLMSceneSchema),
  cta: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    onScreenText: z.string(),
  }),
});

export const RenderSceneSchema = z.object({
  id: z.string(),
  duration: z.number(),
  description: z.string(),
  text: z.string().optional(),
  visualElements: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

export type RenderScene = z.infer<typeof RenderSceneSchema>;
export const RenderScenesSchema = z.array(RenderSceneSchema);

export type LLMScene = z.infer<typeof LLMSceneSchema>;
export type VideoPlan = z.infer<typeof VideoPlanSchema>;
