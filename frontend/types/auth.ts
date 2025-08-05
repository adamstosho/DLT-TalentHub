export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: "talent" | "recruiter" | "admin"
  avatar?: string
  bio?: string
  location?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "talent" | "recruiter" | "admin"
  phone?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
