import React, { useCallback } from "react";
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadAreaProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
}

export default function FileUploadArea({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: FileUploadAreaProps) {
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragOver(e);
    },
    [onDragOver],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragLeave(e);
    },
    [onDragLeave],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop(e);
    },
    [onDrop],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CAD Files</CardTitle>
        <CardDescription>
          Supported formats: STL, STEP, OBJ, 3MF, PLY
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragOver
              ? "border-[#2563eb] bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={onClick}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-gray-500">You can upload multiple files at once</p>
        </div>
      </CardContent>
    </Card>
  );
}
