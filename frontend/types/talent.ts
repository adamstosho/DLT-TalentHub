import type { Skill, Experience, Education, Availability, Salary } from "./common"

export interface Talent {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    bio?: string
    location?: string
    phone?: string
  }
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  availability: Availability
  salary: Salary
  cv?: {
    url: string
    public_id: string
    filename: string
    uploadedAt: string
  }
  portfolio?: {
    github?: string
    linkedin?: string
    website?: string
    behance?: string
    dribbble?: string
    otherLinks?: Array<{
      title: string
      url: string
    }>
  }
  certifications?: Array<{
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
    credentialId?: string
    url?: string
  }>
  languages?: Array<{
    name: string
    proficiency: "basic" | "conversational" | "fluent" | "native"
  }>
  isPublic: boolean
  isProfileComplete: boolean
  profileCompletionPercentage: number
  views: number
  lastProfileUpdate: string
  createdAt: string
  updatedAt: string
}

export interface TalentUpdateRequest {
  skills?: Skill[]
  experience?: Experience[]
  education?: Education[]
  availability?: Availability
  salary?: Salary
}
