"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "@/lib/api"
import type { User, LoginCredentials, RegisterData, AuthResponse } from "@/types/auth"
import toast from "react-hot-toast"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("accessToken")
      if (storedToken) {
        setToken(storedToken)
        try {
          const response = await api.get("/auth/me")
          setUser(response.data.data.user)
        } catch (error) {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<{ data: AuthResponse }>("/auth/login", credentials)
      const { user, accessToken, refreshToken } = response.data.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      setToken(accessToken)
      setUser(user)

      toast.success("Login successful!")
      return user
    } catch (error: any) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post<{ data: AuthResponse }>("/auth/register", data)
      const { user, accessToken, refreshToken } = response.data.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      setToken(accessToken)
      setUser(user)

      toast.success("Registration successful!")
      return user
    } catch (error: any) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setToken(null)
      setUser(null)
      toast.success("Logged out successfully")
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
