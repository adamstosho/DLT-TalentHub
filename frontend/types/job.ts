export interface Job {
  _id: string
  title: string
  description: string
  company: {
    name: string
    logo?: {
      url?: string
      public_id?: string
    }
    website?: string
  }
  type: "full-time" | "part-time" | "contract" | "freelance" | "internship"
  category: string
  skills: string[]
  requirements: string[]
  responsibilities?: string[]
  location: {
    type: 'remote' | 'hybrid' | 'onsite'
    city?: string
    country?: string
    address?: string
  }
  salary: {
    min: number
    max: number
    currency: string
    period: string
    isNegotiable?: boolean
  }
  experience?: {
    min: number
    max: number
    level?: string
  }
  status: "active" | "draft" | "paused" | "closed"
  isUrgent: boolean
  isFeatured: boolean
  recruiterId: string
  views: number
  applications: {
    total: number
    shortlisted: number
    rejected: number
  }
  createdAt: string
  updatedAt: string
}

export interface JobCreateRequest {
  title: string
  description: string
  company: {
    name: string
    logo?: {
      url?: string
      public_id?: string
    }
    website?: string
  }
  type: "full-time" | "part-time" | "contract" | "freelance" | "internship"
  category: string
  skills: string[]
  requirements: string[]
  responsibilities?: string[]
  location: {
    type: 'remote' | 'hybrid' | 'onsite'
    city?: string
    country?: string
    address?: string
  }
  salary: {
    min: number
    max: number
    currency: string
    period?: string
  }
  experience?: {
    min: number
    max: number
    level?: string
  }
  isUrgent?: boolean
  isFeatured?: boolean
}

export interface JobApplication {
  _id: string
  jobId: string
  talentId: string
  status: "pending" | "reviewed" | "shortlisted" | "interviewed" | "offered" | "accepted" | "rejected"
  coverLetter?: string
  expectedSalary?: {
    amount: number
    currency: string
  }
  availability?: {
    startDate: string
    hoursPerWeek?: number
  }
  notes?: string
  appliedAt: string
  updatedAt: string
  job?: Job
  talent?: any
}

export interface JobApplicationRequest {
  coverLetter?: string
  expectedSalary?: {
    amount: number
    currency: string
  }
  availability?: {
    startDate: string
    hoursPerWeek?: number
  }
}

export interface Message {
  _id: string
  application: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  recipient: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  content: string
  isRead: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
}
