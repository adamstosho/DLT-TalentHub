export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Skill {
  name: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  yearsOfExperience: number
}

export interface Experience {
  title: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  description?: string
}

export interface Education {
  degree: string
  institution: string
  fieldOfStudy: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  grade?: string
}

export interface Availability {
  status: "available" | "busy" | "unavailable"
  noticePeriod?: number
  preferredWorkType?: string[]
  remotePreference?: "remote" | "hybrid" | "onsite"
}

export interface Salary {
  currency: string
  minAmount: number
  maxAmount: number
  period: "hourly" | "daily" | "weekly" | "monthly" | "yearly"
}
