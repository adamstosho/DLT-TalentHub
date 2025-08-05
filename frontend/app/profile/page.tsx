"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { uploadAvatar } from "@/lib/upload"
import { User, Briefcase, GraduationCap, FileText, Upload, Edit, Save, X, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  avatar?: {
    url: string
    public_id: string
  }
  bio?: string
  location?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TalentProfile {
  _id: string
  user: UserProfile
  skills: Array<{
    name: string
    level: string
    yearsOfExperience: number
  }>
  experience: Array<{
    title: string
    company: string
    startDate: string
    endDate?: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    field: string
    graduationYear: number
  }>
  portfolio?: string
  certifications: string[]
  languages: string[]
  availability: {
    status: string
    startDate?: string
    hoursPerWeek?: number
  }
  salary: {
    min: number
    max: number
    currency: string
  }
  cv?: {
    url: string
    public_id: string
    filename: string
    uploadedAt: string
  }
}

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null)

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
  })

  const [skills, setSkills] = useState<Array<{
    name: string
    level: string
    yearsOfExperience: number
  }>>([])
  const [experience, setExperience] = useState<Array<{
    title: string
    company: string
    startDate: string
    endDate?: string
    description: string
  }>>([])
  const [education, setEducation] = useState<Array<{
    degree: string
    institution: string
    field: string
    graduationYear: number
  }>>([])

  // Modal states
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Form data for modals
  const [skillForm, setSkillForm] = useState({
    name: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced" | "expert",
    yearsOfExperience: 0,
  })

  const [experienceForm, setExperienceForm] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  })

  const [educationForm, setEducationForm] = useState({
    degree: "",
    institution: "",
    field: "",
    graduationYear: new Date().getFullYear(),
  })

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
      return
    }

    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Fetch user profile
      const userResponse = await api.get(`/users/${user?._id}`)
      console.log("User profile response:", userResponse.data)
      const userData = userResponse.data.data.user
      setUserProfile(userData)

      // Populate personal info form
      setPersonalInfo({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        location: userData.location || "",
      })

      // If user is talent, fetch talent profile
      if (user?.role === "talent") {
        try {
          const talentResponse = await api.get("/talents/profile")
          console.log("Talent profile response:", talentResponse.data)
          const talentData = talentResponse.data.data.talent
          setTalentProfile(talentData)

          // Populate talent-specific forms
          setSkills(talentData.skills || [])
          setExperience(talentData.experience || [])
          setEducation(talentData.education || [])
        } catch (error) {
          console.log("No talent profile found or error:", error)
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalInfoSave = async () => {
    try {
      setSaving(true)
      const response = await api.put("/users/profile", personalInfo)
      console.log("Profile update response:", response.data)
      
      const updatedUser = response.data.data.user
      setUserProfile(updatedUser)
      updateUser(updatedUser)
      
      toast.success("Personal information updated successfully")
    } catch (error: any) {
      console.error("Failed to update personal info:", error)
      toast.error(error.response?.data?.message || "Failed to update personal information")
    } finally {
      setSaving(false)
    }
  }

  const handleTalentProfileSave = async () => {
    if (user?.role !== "talent") return

    try {
      setSaving(true)
      const talentData = {
        skills,
        experience,
        education,
      }
      
      const response = await api.put("/talents/profile", talentData)
      console.log("Talent profile update response:", response.data)
      
      const updatedTalent = response.data.data.talent
      setTalentProfile(updatedTalent)
      
      toast.success("Talent profile updated successfully")
    } catch (error: any) {
      console.error("Failed to update talent profile:", error)
      toast.error(error.response?.data?.message || "Failed to update talent profile")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const avatarUrl = await uploadAvatar(file)
      
      // Update user profile with new avatar
      const response = await api.post("/users/avatar", { avatar: file })
      console.log("Avatar upload response:", response.data)
      
      const updatedUser = { ...user, avatar: response.data.data.avatar }
      updateUser(updatedUser)
      setUserProfile(prev => prev ? { ...prev, avatar: response.data.data.avatar } : null)
      
      toast.success("Avatar uploaded successfully")
    } catch (error: any) {
      console.error("Failed to upload avatar:", error)
      toast.error(error.response?.data?.message || "Failed to upload avatar")
    }
  }

  const handleAddSkill = () => {
    if (skillForm.name.trim()) {
      setSkills([...skills, { ...skillForm }])
      setSkillForm({ name: "", level: "beginner", yearsOfExperience: 0 })
      setShowSkillModal(false)
    }
  }

  const handleEditSkill = (index: number) => {
    setSkillForm(skills[index] as any)
    setEditingIndex(index)
    setShowSkillModal(true)
  }

  const handleDeleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleAddExperience = () => {
    if (experienceForm.title.trim() && experienceForm.company.trim()) {
      setExperience([...experience, { ...experienceForm }])
      setExperienceForm({ title: "", company: "", startDate: "", endDate: "", description: "" })
      setShowExperienceModal(false)
    }
  }

  const handleEditExperience = (index: number) => {
    setExperienceForm(experience[index] as any)
    setEditingIndex(index)
    setShowExperienceModal(true)
  }

  const handleDeleteExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  const handleAddEducation = () => {
    if (educationForm.degree.trim() && educationForm.institution.trim()) {
      setEducation([...education, { ...educationForm }])
      setEducationForm({ degree: "", institution: "", field: "", graduationYear: new Date().getFullYear() })
      setShowEducationModal(false)
    }
  }

  const handleEditEducation = (index: number) => {
    setEducationForm(education[index])
    setEditingIndex(index)
    setShowEducationModal(true)
  }

  const handleDeleteEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and profile information</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            {user?.role === "talent" && (
              <>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={userProfile?.avatar?.url || user?.avatar?.url || "/user-avatar.svg"} 
                      alt={`${userProfile?.firstName} ${userProfile?.lastName}`} 
                    />
                    <AvatarFallback>
                      {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <FileUpload
                      onUpload={handleAvatarUpload}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                    >
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Avatar
                      </Button>
                    </FileUpload>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Personal Info Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={personalInfo.bio}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handlePersonalInfoSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.role === "talent" && (
            <>
              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Skills
                    </CardTitle>
                    <CardDescription>
                      Add and manage your professional skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Your Skills</h3>
                        <Button onClick={() => setShowSkillModal(true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </div>

                      {skills.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No skills added yet. Add your first skill to get started.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {skills.map((skill, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">{skill.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    Level: {skill.level} • {skill.yearsOfExperience} years
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSkill(index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSkill(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Work Experience
                    </CardTitle>
                    <CardDescription>
                      Add your professional work experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Experience</h3>
                        <Button onClick={() => setShowExperienceModal(true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      </div>

                      {experience.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No experience added yet. Add your first work experience.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {experience.map((exp, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{exp.title}</h4>
                                  <p className="text-sm text-gray-600">{exp.company}</p>
                                  <p className="text-xs text-gray-500">
                                    {exp.startDate} - {exp.endDate || "Present"}
                                  </p>
                                  {exp.description && (
                                    <p className="text-sm mt-2">{exp.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditExperience(index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteExperience(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Save Button for Talent Profile */}
        {user?.role === "talent" && (
          <div className="mt-8 flex justify-end">
            <Button onClick={handleTalentProfileSave} disabled={saving} size="lg">
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        )}

        {/* Modals */}
        {/* Skill Modal */}
        {showSkillModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingIndex !== null ? "Edit Skill" : "Add Skill"}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skillName">Skill Name</Label>
                  <Input
                    id="skillName"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="skillLevel">Level</Label>
                  <Select
                    value={skillForm.level}
                    onValueChange={(value) => setSkillForm({ ...skillForm, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={skillForm.yearsOfExperience}
                    onChange={(e) => setSkillForm({ ...skillForm, yearsOfExperience: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSkillModal(false)
                    setEditingIndex(null)
                    setSkillForm({ name: "", level: "beginner", yearsOfExperience: 0 })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSkill}>
                  {editingIndex !== null ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Experience Modal */}
        {showExperienceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingIndex !== null ? "Edit Experience" : "Add Experience"}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expTitle">Job Title</Label>
                  <Input
                    id="expTitle"
                    value={experienceForm.title}
                    onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expCompany">Company</Label>
                  <Input
                    id="expCompany"
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expStartDate">Start Date</Label>
                    <Input
                      id="expStartDate"
                      type="date"
                      value={experienceForm.startDate}
                      onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expEndDate">End Date</Label>
                    <Input
                      id="expEndDate"
                      type="date"
                      value={experienceForm.endDate}
                      onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expDescription">Description</Label>
                  <Textarea
                    id="expDescription"
                    value={experienceForm.description}
                    onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExperienceModal(false)
                    setEditingIndex(null)
                    setExperienceForm({ title: "", company: "", startDate: "", endDate: "", description: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddExperience}>
                  {editingIndex !== null ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 