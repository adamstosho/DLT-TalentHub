"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Trash2, Download, Eye } from "lucide-react"
import api from "@/lib/api"
import toast from "react-hot-toast"

interface CVData {
  url: string
  filename: string
  uploadedAt: string
}

interface CVUploadProps {
  currentCV?: CVData
  onCVUpdate: (cv: CVData | null) => void
}

export const CVUpload: React.FC<CVUploadProps> = ({ currentCV, onCVUpdate }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadCV(file)
    }
  }

  const uploadCV = async (file: File) => {
    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("cv", file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await api.post("/talents/cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const cvData = response.data.data.cv
      onCVUpdate(cvData)
      toast.success("CV uploaded successfully!")
    } catch (error: any) {
      console.error("CV upload error:", error)
      toast.error(error.response?.data?.message || "Failed to upload CV")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const deleteCV = async () => {
    if (!currentCV) return

    setIsDeleting(true)
    try {
      await api.delete("/talents/cv")
      onCVUpdate(null)
      toast.success("CV deleted successfully!")
    } catch (error: any) {
      console.error("CV delete error:", error)
      toast.error(error.response?.data?.message || "Failed to delete CV")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CV / Resume
        </CardTitle>
        <CardDescription>
          Upload your CV or resume to help recruiters find you. Supported formats: PDF, DOC, DOCX (max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentCV ? (
          <div className="space-y-4">
            {/* Current CV Display */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currentCV.filename}</span>
                    <Badge variant="secondary">{getFileExtension(currentCV.filename)}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(currentCV.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentCV.url, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = currentCV.url
                    link.download = currentCV.filename
                    link.click()
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteCV}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>

            {/* Upload New CV */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">Upload a new CV to replace the current one:</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload new CV file"
                title="Upload new CV file"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload New CV"}
              </Button>
            </div>
          </div>
        ) : (
          /* No CV Upload Area */
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload CV file"
                title="Upload CV file"
              />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload your CV</h3>
              <p className="text-gray-500 mb-4">
                Drag and drop your CV here, or click to browse files
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading CV...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Tips */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips for a great CV:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Keep it concise and well-formatted</li>
              <li>• Include relevant skills and experience</li>
              <li>• Update it regularly with new achievements</li>
              <li>• Use clear, professional language</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 