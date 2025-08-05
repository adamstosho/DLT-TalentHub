import axios, { type AxiosInstance, type AxiosResponse } from "axios"
import toast from "react-hot-toast"

export interface ApiResponse<T = any> {
  status: "success" | "error"
  message: string
  data?: T
  errors?: string[]
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for JWT tokens
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor for token refresh and error handling
let isRefreshing = false

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true
      isRefreshing = true

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          try {
            const response = await api.post("/auth/refresh", { refreshToken })
            const { accessToken } = response.data.data
            localStorage.setItem("accessToken", accessToken)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            isRefreshing = false
            return api.request(originalRequest)
          } catch (refreshError) {
            isRefreshing = false
            // Clear tokens and redirect to login on refresh failure
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            
            // Only redirect if not already on login page to prevent infinite redirects
            if (window.location.pathname !== "/login") {
              window.location.href = "/login"
            }
            return Promise.reject(refreshError)
          }
        } else {
          isRefreshing = false
          // No refresh token, redirect to login
          if (window.location.pathname !== "/login") {
            window.location.href = "/login"
          }
        }
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error("An unexpected error occurred")
    }

    return Promise.reject(error)
  },
)

export default api
