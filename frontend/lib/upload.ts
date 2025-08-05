import api from "./api"

export interface UploadResponse {
  url: string
  publicId?: string
}

export const uploadAvatar = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append("avatar", file)

  const response = await api.post<{ data: UploadResponse }>("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return response.data.data
}

export const uploadCV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append("cv", file)

  const response = await api.post<{ data: UploadResponse }>("/talents/cv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return response.data.data
}

export const validateFile = (file: File, type: "image" | "document") => {
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB")
  }

  if (type === "image") {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and GIF files are allowed")
    }
  } else if (type === "document") {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only PDF, DOC, and DOCX files are allowed")
    }
  }
}
