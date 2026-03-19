import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FALLBACK_IMAGE =
  "https://placehold.co/1792x1024/1a1a2e/ffffff?text=Scene";

const sanitizePrompt = (prompt: string): string => {
  return (
    prompt
      // Remove LLM placeholder artifacts
      .replace(/PRODUCT_IMAGE_\d+/gi, "product")
      .replace(/B-ROLL:\s*/gi, "")
      .replace(/ICON:\s*/gi, "")
      .replace(/TEXT_ONLY/gi, "minimalist text on clean background")
      // Remove words that commonly trigger content filters
      .replace(
        /\b(violent|violence|blood|weapon|nude|naked|explicit|drug|kill|death|gore)\b/gi,
        "",
      )
      // Clean up extra whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
};

const generateImage = async (prompt: string): Promise<string> => {
  try {
    const res = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "natural",
    });

    if (!res.data?.[0]?.url) throw new Error("No image generated");
    return res.data[0].url;
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status: number }).status === 400
    ) {
      console.warn("DALL-E content filter triggered, using fallback image.");
      console.warn("Blocked prompt:", prompt.slice(0, 100));
      return FALLBACK_IMAGE;
    }
    throw error;
  }
};

export const generateImageForScenes = async (
  scenes: Array<{
    description: string;
    text?: string;
    visualElements?: string[];
  }>,
): Promise<string[]> => {
  const images: string[] = [];

  for (const scene of scenes) {
    const visualContext =
      scene.visualElements
        ?.filter(
          (v) => !v.startsWith("PRODUCT_IMAGE") && !v.startsWith("B-ROLL"),
        )
        .join(", ") || "";

    const rawPrompt =
      `Professional product photography, commercial advertisement style, 
      cinematic lighting, vibrant colors, 16:9 aspect ratio. 
      ${scene.text ? `Subject: ${scene.text}.` : ""}
      ${sanitizePrompt(scene.description)}.
      ${visualContext ? sanitizePrompt(visualContext) : ""}`.trim();

    const imagePrompt = rawPrompt.slice(0, 900); // DALL-E 3 safe limit

    const imageUrl = await generateImage(imagePrompt);
    images.push(imageUrl);

    // Rate limit between requests (except after last)
    if (images.length < scenes.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return images;
};
