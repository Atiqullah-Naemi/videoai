"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadThing } from "@/lib/uploadthing";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { ImageUploader } from "./image-uploader";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BrainCircuit, Crown, Lock, MoveRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { usePro } from "@/hooks/usePro";

const formSchema = z.object({
  title: z.string().min(1, "Video title is required"),
  prompt: z.string().min(1, "Video prompt is required"),
  duration: z.number().min(5).max(300),
  images: z.array(z.instanceof(File)).optional(),
});

export const VideoGenerator = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      prompt: "",
      duration: 10,
      images: [],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { startUpload } = useUploadThing("imageUploader");
  const { isPro } = usePro();

  const durationValue = useWatch({
    control: form.control,
    name: "duration",
  });

  const onSubmit = async ({
    title,
    prompt,
    duration,
    images,
  }: z.infer<typeof formSchema>) => {
    try {
      let imageUrls: string[] = [];

      if (images && images.length > 0) {
        const uploaded = await startUpload(images);
        imageUrls = uploaded?.map((img) => img.ufsUrl) ?? [];
      }

      const res = await fetch("/api/videos/generate", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          prompt,
          duration,
          productImages: imageUrls,
        }),
      });

      const data = await res.json();

      toast.success("Video generation started");
      router.push(`/dashboard/videos/${data.video.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate video");
    }
  };

  const improvePrompt = async () => {
    const currentPrompt = form.getValues("prompt");
    setIsLoading(true);
    try {
      const res = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await res.json();

      form.setValue("prompt", data?.improvedPrompt ?? currentPrompt, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });

      toast.success("Prompt improved");
    } catch {
      toast.error("Failed to improve prompt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProClick = async () => {
    if (!isPro) {
      await authClient.checkout({ slug: "videoai-pro" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Generate AI Video</h1>
      </div>

      <form
        className="space-y-8 shadow-lg border p-7 rounded-md"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalide={fieldState.invalid}>
                <FieldLabel htmlFor="video-title">Video title</FieldLabel>
                <Input
                  {...field}
                  id="video-title"
                  placeholder="Amazing proudct video"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="prompt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalide={fieldState.invalid}>
                <FieldLabel htmlFor="video-prompt">Video prompt</FieldLabel>
                <Textarea
                  {...field}
                  id="video-prompt"
                  placeholder="Descript your video..."
                  aria-invalid={fieldState.invalid}
                  className="min-h-36"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

                <Button
                  type="button"
                  size="lg"
                  onClick={improvePrompt}
                  className="cursor-pointer max-w-48 self-end"
                >
                  <BrainCircuit />
                  {isLoading ? <Spinner /> : "Improve prompt"}
                </Button>
              </Field>
            )}
          />

          <Controller
            name="duration"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalide={fieldState.invalid}>
                <FieldLabel htmlFor="video-duration">
                  Video duration in seconds: {durationValue}s
                </FieldLabel>
                <Slider
                  min={5}
                  max={300}
                  step={1}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  id="video-duration"
                  aria-invalid={fieldState.invalid}
                />
                <div className="text-muted-foreground mt-1 flex justify-between text-sm">
                  <span>10s</span>
                  <span>5 minutes</span>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="images"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalide={fieldState.invalid}>
                <FieldLabel htmlFor="video-images">
                  Video images (optional)
                  {!isPro && (
                    <span className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                      <Crown className="h-3 w-3" />
                      PRO
                    </span>
                  )}
                </FieldLabel>
                <div className="relative">
                  <ImageUploader
                    value={field.value ?? []}
                    onChange={(files) => isPro && field.onChange(files)}
                  />

                  {!isPro && (
                    <div
                      className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center rounded-md
                    bg-white/60 backdrop-blur-[2px]"
                      onClick={handleProClick}
                    >
                      <Lock className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Upgrade to Pro to upload images
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-amber-500 text-amber-600 hover:bg-amber-50"
                      >
                        Upgrade now
                      </Button>
                    </div>
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="cursor-pointer max-w-48 self-end flex justify-between items-center"
          >
            <BrainCircuit />
            {form.formState.isSubmitting ? <Spinner /> : "Generate video"}
            <MoveRight />
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};
