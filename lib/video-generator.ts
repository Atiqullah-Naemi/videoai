import { LLMScene, RenderScene, VideoPlan, VideoPlanSchema } from "@/schemas";
import { ElevenLabsClient } from "elevenlabs";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { getPrompt } from "./prompt";

export type GeneratedVideoData = {
  title: string;
  script: string;
  scenes: RenderScene[];
  llmPlan: VideoPlan;
};

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export const generatedVoiceOver = async (
  text: string,
  voiceId: string = "ZF6FPAbjXT4488VcRRnw",
) => {
  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const chunks: Buffer[] = [];

  for await (const chunk of audio) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

export const improvePrompt = async (prompt: string) => {
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: `You are a video marketing expert. improve this video prompt to be more specific, engaing, and effective for video generation:
    User prompt: ${prompt}
    Provide an improved version of the user prompt so that:
      - Specifies visual style and mode
      - Includes specific scenes or shots
      - Define target audience
      - Suggest key messaging points
      - Maintain the original intent but make it more actionable

    return only the improved prompt, not explanation.
    `,
  });

  return text;
};

const toRenderScenes = (llmScenes: LLMScene[]) => {
  return llmScenes.map((s) => ({
    id: s.id,
    duration: s.durationSeconds,
    description: s.goal || s.voiceover,
    text: s.textOverlays?.[0]?.text,
    visualElements: s.visualElements,
    imageUrl: s.imageUrl,
  }));
};

const buildTitleFromPrompt = (prompt: string) => {
  const cleaned = prompt.replace(/\s+/g, " ").trim();

  return cleaned.length > 60 ? `${cleaned.slice(0, 57)}...` : cleaned;
};

const joinVoiceOver = (llmScenes: LLMScene[]) => {
  return llmScenes.map((s) => s.voiceover).join("\n\n");
};

export const generatedVideoScript = async (
  prompt: string,
  duration: number,
  productImages?: string[],
) => {
  const hasImages = !!productImages?.length;
  const numberOfScenes = Math.max(Math.ceil(duration / 8), 3);

  const { output } = await generateText({
    model: google("gemini-3.1-pro-preview"),
    output: Output.object({ schema: VideoPlanSchema }),
    prompt: getPrompt(
      prompt,
      duration,
      numberOfScenes,
      hasImages,
      productImages,
    ),
  });

  const plan = output as VideoPlan;

  let llmScenes = plan.scenes;

  if (hasImages && productImages) {
    llmScenes = llmScenes.map((s, i) => ({
      ...s,
      imageUrl: productImages[i % productImages.length],
    }));
  }

  const scenes = toRenderScenes(llmScenes);

  return {
    title: buildTitleFromPrompt(prompt),
    script: joinVoiceOver(llmScenes),
    scenes,
    llmPlan: plan,
  };
};
