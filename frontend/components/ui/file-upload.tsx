"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "./button"
import { Progress } from "./progress"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: Record<string, string[]>
  maxSize?: number
  className?: string
  children?: React.ReactNode
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  children,
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setError(null)
      setUploadProgress(0)

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 100)

        await onUpload(file)
        setUploadProgress(100)

        setTimeout(() => {
          setUploading(false)
          setUploadProgress(0)
        }, 500)
      } catch (error: any) {
        setError(error.message || "Upload failed")
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  const isImage = Object.keys(accept).some((key) => key.startsWith("image"))

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-secondary bg-secondary/5" : "border-gray-300 hover:border-secondary",
          uploading && "pointer-events-none opacity-50",
        )}
      >
        <input {...getInputProps()} />

        {children || (
          <div className="space-y-4">
            <div className="flex justify-center">
              {isImage ? (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? "Drop the file here" : "Drag & drop a file here"}
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to select a file</p>
            </div>

            <Button type="button" variant="outline" disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="mt-2 text-sm text-red-600">{fileRejections[0].errors[0].message}</div>
      )}
    </div>
  )
}
