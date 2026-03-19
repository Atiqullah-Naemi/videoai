export const getPrompt = (
  prompt: string,
  duration: number,
  numberOfScenes: number,
  hasImages: boolean,
  productImages?: string[],
) => `Generate a high-quality Remotion-ready video plan and voice-over script for a ${duration}-second video based on this prompt:
"${prompt}"

You MUST optimize for FAST PACED VISUALS suitable for short-form/high-retention ads.

CRITICAL DURATION & TIMING RULES:
- Total duration MUST equal exactly ${duration} seconds.
- Create EXACTLY ${numberOfScenes} scenes.
- Each scene duration must sum perfectly to ${duration} seconds.
- Provide all timing in BOTH seconds and frames.
- Assume FPS = 60.
- 1 second = 60 frames.

CRITICAL VISUAL PACING REQUIREMENTS (MOST IMPORTANT):
- The video must change visuals at least 3–5 times PER SECOND on average.
- Therefore, you MUST include a "beats" list inside each scene with micro-shots.
- Each beat is a single visual change (cut, zoom, overlay change, background swap, product angle change, text change, etc.).
- MAX beat length: 0.35 seconds (≈ ${Math.round(60 * 0.35)} frames).
- MIN beat length: 0.12 seconds (≈ ${Math.round(60 * 0.12)} frames).
- Across the whole video, total beats must be >= ${duration * 3} and ideally around ${duration * 4}.
- Avoid long static shots. No beat should be "hold still with the same image".

VOICEOVER REQUIREMENTS:
- Narration must be natural, persuasive, and detailed enough to fill the entire duration.
- Target word count: at least ${Math.round(duration * 2.5)} words.
- Voiceover can be continuous, but visuals MUST cut fast and stay aligned with the spoken beats.
- Provide VO per scene, and optionally mark emphasis words for kinetic text.

INPUT ASSETS RULES:
${hasImages ? `- I will provide ${productImages!.length} product image(s) to use in the video.` : "- Images may be generated or sourced later."}
- DO NOT include imageUrl anywhere.
- Instead, reference images via placeholders like "PRODUCT_IMAGE_1", "PRODUCT_IMAGE_2", etc. (if images are provided).
- You may also reference "B-ROLL: lifestyle/usage shot", "ICON: feature icon", "TEXT_ONLY" beats.

CRITICAL SCENES REQUIREMENTS:
- For each scene "goal", describe it like a professional Midjourney prompt: "High-resolution, 8k, cinematic lighting, [subject], vibrant colors, professional photography."
- Ensure "textOverlays" are short (3-5 words max) for high impact.
- Set "textColor" to highly contrasting colors (e.g., if background is dark, text MUST be #FFFFFF or #00FF00).

OUTPUT FORMAT (STRICT JSON ONLY, NO MARKDOWN, NO EXPLANATIONS):
Return a single JSON object with this exact structure:

{
  "meta": {
    "durationSeconds": ${duration},
    "fps": 60,
    "totalFrames": ${duration} * 60,
    "numberOfScenes": ${numberOfScenes},
    "visualPacing": {
      "minCutsPerSecond": 3,
      "targetCutsPerSecond": 4,
      "maxBeatSeconds": 0.35,
      "minBeatSeconds": 0.12
    }
  },
  "styleGuide": {
    "brandVibe": "premium ecommerce ad / modern / high-contrast",
    "fontSuggestions": ["Inter", "Sora", "Manrope"],
    "colorPalette": [
      { "bg": "#0B0F17", "text": "#FFFFFF", "accent": "#6D5EF5" },
      { "bg": "#FFFFFF", "text": "#0B0F17", "accent": "#111827" }
    ],
    "motionRules": [
      "Always add motion: parallax, zoom, slide, blur-in, whip-pan, or kinetic text.",
      "Use quick easing; avoid slow cinematic holds.",
      "Use text emphasis on key claims and numbers."
    ]
  },
  "scenes": [
    {
      "id": "scene_1",
      "durationSeconds": <number>,
      "durationFrames": <number>,
      "goal": "<what this scene accomplishes>",
      "voiceover": "<narration text for this scene>",
      "musicMood": "<optional: upbeat / cinematic / minimal>",
      "background": { "color": "<hex>" },
      "textStyle": { "color": "<hex>", "accentColor": "<hex>" },
      "animation": "<fade-in|slide-up|zoom-in|none>",
      "textOverlays": [
        { "text": "<short headline>", "startFrame": <int>, "endFrame": <int>, "style": "headline|caption|badge" }
      ],
      "visualElements": [
        "<product image placeholder or icon type>",
        "<props like feature icons, shapes, gradients>"
      ],
      "beats": [
        {
          "beatId": "s1_b1",
          "startFrame": <int>,
          "durationFrames": <int>,
          "type": "product_closeup|product_angle|feature_text|testimonial|before_after|how_it_works|offer|cta|broll|text_only",
          "visual": "<describe exactly what appears and changes here>",
          "motion": "<zoom-in|slide-left|whip-pan|parallax|pop|shake|none>",
          "overlayText": "<optional short on-screen text>",
          "emphasisWords": ["<optional words to highlight>"]
        }
      ]
    }
  ],
  "cta": {
    "primary": "<call to action>",
    "secondary": "<optional>",
    "onScreenText": "<short CTA text>"
  }
}

VALIDATION REQUIREMENTS (MUST SATISFY):
- Sum(scene.durationFrames) == meta.totalFrames
- Beats must cover the scene timeline fully with no gaps and no overlaps.
- Total beats across all scenes >= ${duration * 3}.
- No beat durationFrames > ${Math.round(60 * 0.35)}.
- JSON must be valid and parseable.
`;
