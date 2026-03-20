# 🎬 videoai: Text-to-Video SaaS Platform

**videoai** is a production-ready Generative AI platform that enables users to create professional-grade videos in minutes. By simply providing a text prompt or uploading images, the platform automates scriptwriting, voiceover generation, and cinematic video rendering.

---

## 🚀 Key Features

- **AI Video Generation:** Transform simple text prompts into high-fidelity video content.
- **Image-to-Video:** (Pro Feature) Upload custom images to guide the visual output and maintain brand consistency.
- **Smart Prompt Engineering:** Built-in "Improve Prompt" tool to refine user input for optimized AI results.
- **Variable Duration:** Generate videos ranging from 5 seconds to 5 minutes.
- **Secure Authentication:** Full login/signup flow with email and Social Auth (GitHub/Google) powered by **Better Auth**.
- **Subscription Management:** Integrated billing via **Polar** for Free and Pro tiers.
- **Event-Driven Pipeline:** Scalable video rendering architecture managed by **Inngest**.
- **Automated Assets:** Seamlessly generates scripts, voiceovers, and visual sequences.

---

## 🛠 Tech Stack

### Frontend & Framework

- **Next.js:** React framework for core application logic and SSR.
- **Tailwind CSS:** Responsive, utility-first styling.
- **Shadcn/UI:** Accessible, modern UI components.
- **TypeScript:** Full type safety across the stack.

### AI & Rendering

- **Remotion:** Programmatic video creation and frame-by-frame rendering.
- **OpenAI / Anthropic:** LLMs for script generation and prompt enhancement.
- **ElevenLabs:** For high-quality, realistic AI voiceovers.

### Backend & Infrastructure

- **Inngest:** Orchestrates the background video generation pipeline (Jobs/Workflows).
- **Prisma:** Type-safe ORM for database interaction.
- **Neon DB:** Serverless Postgres database.
- **Better Auth:** Modern authentication framework.
- **Polar:** Handling SaaS subscriptions and payments.

---

## 🏗 Workflow Architecture

1.  **Input:** User provides a title, prompt, and selects duration.
2.  **Orchestration:** **Inngest** triggers the video pipeline:
    - `fetch-video-assets`: Gathers initial data.
    - `generate-script`: AI generates a storyboard and voiceover script.
    - `generate-voiceover`: ElevenLabs renders the audio.
    - `render-video`: **Remotion** compiles assets into a final MP4.
3.  **Completion:** The video is saved to the user's dashboard for playback and download.

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (Neon)
- API Keys: OpenAI, ElevenLabs, Inngest, and Polar.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/videoai.git
    cd videoai
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file and populate it with your database URL, Auth secrets, and AI provider API keys.

4.  **Database Migration:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 💳 Pricing Tiers

| Feature          | Starter (Free) | Pro ($19.99/mo) |
| :--------------- | :------------- | :-------------- |
| Videos / Month   | 5              | Unlimited       |
| Resolution       | 720p           | 1080p / 4K      |
| Watermark        | Included       | Removed         |
| Image Uploads    | No             | Yes             |
| AI Prompt Tuning | Standard       | Advanced        |
