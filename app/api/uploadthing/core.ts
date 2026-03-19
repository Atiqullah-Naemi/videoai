import { auth } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user) throw new UploadThingError("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  videoUploader: f({
    video: { maxFileSize: "2GB" },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user) throw new UploadThingError("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  audioUploader: f({
    audio: { maxFileSize: "32MB" },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user) throw new UploadThingError("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
