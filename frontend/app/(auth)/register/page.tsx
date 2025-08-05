"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, EyeOff, Loader2, User, Building, CheckCircle, XCircle } from "lucide-react"

interface ValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
}

interface FieldValidation {
  isValid: boolean
  message: string
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "talent"

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole as "talent" | "recruiter",
    phone: "",
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({})

  const { register } = useAuth()
  const router = useRouter()

  // Validation functions
  const validateName = (name: string): FieldValidation => {
    if (name.length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters" }
    }
    if (name.length > 50) {
      return { isValid: false, message: "Name cannot exceed 50 characters" }
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return { isValid: false, message: "Name can only contain letters and spaces" }
    }
    return { isValid: true, message: "" }
  }

  const validateEmail = (email: string): FieldValidation => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" }
    }
    return { isValid: true, message: "" }
  }

  const validatePassword = (password: string): FieldValidation => {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters" }
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return { isValid: false, message: "Password must contain uppercase, lowercase, number, and special character" }
    }
    return { isValid: true, message: "" }
  }

  const validatePhone = (phone: string): FieldValidation => {
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return { isValid: false, message: "Please enter a valid phone number" }
    }
    return { isValid: true, message: "" }
  }

  const validateConfirmPassword = (confirmPassword: string): FieldValidation => {
    if (confirmPassword !== formData.password) {
      return { isValid: false, message: "Passwords do not match" }
    }
    return { isValid: true, message: "" }
  }

  // Real-time validation
  useEffect(() => {
    const errors: ValidationErrors = {}

    if (fieldTouched.firstName) {
      const validation = validateName(formData.firstName)
      if (!validation.isValid) errors.firstName = validation.message
    }

    if (fieldTouched.lastName) {
      const validation = validateName(formData.lastName)
      if (!validation.isValid) errors.lastName = validation.message
    }

    if (fieldTouched.email) {
      const validation = validateEmail(formData.email)
      if (!validation.isValid) errors.email = validation.message
    }

    if (fieldTouched.password) {
      const validation = validatePassword(formData.password)
      if (!validation.isValid) errors.password = validation.message
    }

    if (fieldTouched.confirmPassword) {
      const validation = validateConfirmPassword(formData.confirmPassword)
      if (!validation.isValid) errors.confirmPassword = validation.message
    }

    if (fieldTouched.phone && formData.phone) {
      const validation = validatePhone(formData.phone)
      if (!validation.isValid) errors.phone = validation.message
    }

    setValidationErrors(errors)
  }, [formData, fieldTouched])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    
    // Mark field as touched for validation
    setFieldTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "talent" | "recruiter",
    }))
  }

  const handleBlur = (fieldName: string) => {
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }))
  }

  const isFormValid = () => {
    return (
      validateName(formData.firstName).isValid &&
      validateName(formData.lastName).isValid &&
      validateEmail(formData.email).isValid &&
      validatePassword(formData.password).isValid &&
      validateConfirmPassword(formData.confirmPassword).isValid &&
      (formData.phone ? validatePhone(formData.phone).isValid : true)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched to show validation errors
    setFieldTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true
    })

    if (!isFormValid()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { confirmPassword, ...registerData } = formData
      const user = await register(registerData)
      // Redirect to role-specific dashboard based on user role
      switch (user.role) {
        case "talent":
          router.push("/talent/dashboard")
          break
        case "recruiter":
          router.push("/recruiter/dashboard")
          break
        case "admin":
          router.push("/admin/dashboard")
          break
        default:
          router.push("/")
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicators
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center mb-8">
            <img src="/logo.svg" alt="DLT TalentHub" className="h-12 w-auto" />
          </Link>
          <h2 className="text-3xl font-bold text-primary">Join DLT TalentHub</h2>
          <p className="mt-2 text-gray-600">Create your account and start your journey</p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I want to join as:</Label>
                <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="talent" id="talent" />
                    <User className="h-5 w-5 text-secondary" />
                    <div className="flex-1">
                      <Label htmlFor="talent" className="font-medium">
                        Talent
                      </Label>
                      <p className="text-sm text-gray-500">Looking for tech opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="recruiter" id="recruiter" />
                    <Building className="h-5 w-5 text-secondary" />
                    <div className="flex-1">
                      <Label htmlFor="recruiter" className="font-medium">
                        Recruiter
                      </Label>
                      <p className="text-sm text-gray-500">Hiring tech professionals</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("firstName")}
                    placeholder="John"
                    className={validationErrors.firstName ? "border-red-500" : ""}
                  />
                  {validationErrors.firstName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Doe"
                    className={validationErrors.lastName ? "border-red-500" : ""}
                  />
                  {validationErrors.lastName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="john.doe@example.com"
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  placeholder="+234 123 456 7890"
                  className={validationErrors.phone ? "border-red-500" : ""}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.phone}
                  </p>
                )}
                {formData.phone && !validationErrors.phone && (
                  <p className="text-sm text-gray-500">Enter a valid phone number (e.g., +234 123 456 7890)</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="Create a strong password"
                    className={validationErrors.password ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Password Requirements */}
                {fieldTouched.password && (
                  <div className="space-y-2 mt-2">
                    <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-sm ${passwordChecks.length ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordChecks.length ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordChecks.uppercase ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordChecks.lowercase ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${passwordChecks.number ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordChecks.number ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        One number
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${passwordChecks.special ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordChecks.special ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        One special character (@$!%*?&)
                      </div>
                    </div>
                  </div>
                )}
                
                {validationErrors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Confirm your password"
                    className={validationErrors.confirmPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{" "}
                  <Link href="#" className="text-secondary hover:text-secondary/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-secondary hover:text-secondary/80">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !isFormValid()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign in instead
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
