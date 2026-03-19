"use client";

import Image from "next/image";
import { Label } from "./ui/label";
import React, { useMemo } from "react";
import { X } from "lucide-react";

type ImageUploadProps = {
  value?: File[];
  onChange?: (file: File[]) => void;
  maxFiles?: number;
};

export const ImageUploader = ({
  value = [],
  onChange,
  maxFiles,
}: ImageUploadProps) => {
  const previews = useMemo(() => {
    return value?.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);

    if (!selectedFiles.length) return;

    const nextFiles = [...value, ...selectedFiles].slice(0, maxFiles);
    onChange?.(nextFiles);

    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const nextFiles = value.filter((_, i) => i !== index);
    onChange?.(nextFiles);
  };

  return (
    <div className="space-y-4">
      <Label
        htmlFor="image-upload"
        className="flex min-h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed p-6 text-center"
      >
        <div>
          <p className="font-medium">Drop files here or click to upload</p>
          <p className="text-muted-foreground mt-1 text-sm">
            PNG, JPEG, JPG up 10MB each
          </p>
        </div>
      </Label>

      <input
        type="file"
        id="image-upload"
        accept="image/png,iimage/jpeg,image/jpeg"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {previews.map((item, index) => {
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl border"
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.url}
                    alt={item.file.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
