"use client";

import * as z from "zod";

import axios from "axios";

import MuxPlayer from "@mux/mux-player-react";

import { Pencil, PlusCircle, Video } from "lucide-react";

import { useState } from "react";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { Chapter, MuxData } from "@prisma/client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values
      );
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 border bg-gray-100 rounded-md p-4">
      <section className="font-medium flex items-center justify-between">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}

          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}

          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </section>

      {!isEditing &&
        (!initialData.videoUrl ? (
          <section className="flex items-center justify-center h-60 bg-gray-200 rounded-md">
            <Video className="h-10 w-10 text-gray-500" />
          </section>
        ) : (
          <section className="relative aspect-video mt-2">
            <MuxPlayer playbackId={initialData?.muxData?.playbackId || ""} />
          </section>
        ))}

      {isEditing && (
        <section>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          <span className="text-xs text-muted-foreground mt-4">
            Upload this chapter&apos;s video
          </span>
        </section>
      )}

      {initialData.videoUrl && !isEditing && (
        <span className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video
          does not appear.
        </span>
      )}
    </div>
  );
};
