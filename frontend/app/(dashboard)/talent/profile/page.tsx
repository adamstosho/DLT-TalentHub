"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CVUpload } from "@/components/cv/CVUpload"
import api from "@/lib/api"
import { uploadAvatar, validateFile } from "@/lib/upload"
import type { Talent } from "@/types/talent"
import type { Skill, Experience, Education } from "@/types/common"
import { User, Briefcase, GraduationCap, FileText, Plus, Edit, Trash2, Upload } from "lucide-react"
import toast from "react-hot-toast"

export default function TalentProfilePage() {
  const { user, updateUser } = useAuth()
  const [talent, setTalent] = useState<Talent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingItem, setSavingItem] = useState<string | null>(null)

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
  })

  const [skills, setSkills] = useState<Skill[]>([])
  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [availability, setAvailability] = useState({
    status: "available" as "available" | "busy" | "unavailable",
    startDate: "",
    hoursPerWeek: 40,
  })
  const [salary, setSalary] = useState({
    minAmount: 0,
    maxAmount: 0,
    currency: "USD",
    period: "monthly",
  })

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
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  })

  useEffect(() => {
    const fetchTalentProfile = async () => {
      try {
        const response = await api.get("/talents/profile")
        const talentData = response.data.data.talent
        setTalent(talentData)

        // Populate form data
        if (user) {
          setPersonalInfo({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || "",
            bio: user.bio || "",
            location: user.location || "",
          })
        }

        setSkills(talentData.skills || [])
        setExperience(talentData.experience || [])
        setEducation(talentData.education || [])
        setAvailability(
          talentData.availability || {
            status: "available",
            startDate: "",
            hoursPerWeek: 40,
          },
        )
        setSalary(
          talentData.salary || {
            minAmount: 0,
            maxAmount: 0,
            currency: "USD",
            period: "monthly",
          },
        )
      } catch (error) {
        console.error("Failed to fetch talent profile:", error)
        // If talent profile doesn't exist, that's okay - user can create one
        if (error.response?.status === 404) {
          console.log("No talent profile found, user can create one")
        } else {
          toast.error("Failed to load profile data")
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTalentProfile()
    }
  }, [user])

  const handlePersonalInfoSave = async () => {
    setSaving(true)
    try {
      await api.put("/users/profile", personalInfo)
      updateUser(personalInfo)
      toast.success("Personal information updated successfully")
    } catch (error) {
      toast.error("Failed to update personal information")
    } finally {
      setSaving(false)
    }
  }

  const handleTalentProfileSave = async () => {
    setSaving(true)
    try {
      const payload = {
        skills,
        experience,
        education,
        availability,
        salary,
      }
      await api.put("/talents/profile", payload)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      validateFile(file, "image")
      const result = await uploadAvatar(file)
      updateUser({ avatar: result.url })
      toast.success("Avatar updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar")
    }
  }



  const handleAddSkill = async () => {
    setSavingItem("skill")
    try {
      let updatedSkills
      if (editingIndex !== null) {
        updatedSkills = [...skills]
        updatedSkills[editingIndex] = skillForm
      } else {
        updatedSkills = [...skills, skillForm]
      }
      
      setSkills(updatedSkills)
      
      // Save to backend
      const payload = {
        skills: updatedSkills,
        experience,
        education,
        availability,
        salary,
      }
      await api.put("/talents/profile", payload)
      
      setShowSkillModal(false)
      setEditingIndex(null)
      setSkillForm({ name: "", level: "beginner", yearsOfExperience: 0 })
      toast.success(editingIndex !== null ? "Skill updated successfully" : "Skill added successfully")
    } catch (error) {
      console.error("Failed to save skill:", error)
      toast.error("Failed to save skill")
    } finally {
      setSavingItem(null)
    }
  }

  const handleEditSkill = (index: number) => {
    setSkillForm(skills[index])
    setEditingIndex(index)
    setShowSkillModal(true)
  }

  const handleDeleteSkill = async (index: number) => {
    setSavingItem("skill")
    try {
      const updatedSkills = skills.filter((_, i) => i !== index)
      setSkills(updatedSkills)
      
      // Save to backend
      const payload = {
        skills: updatedSkills,
        experience,
        education,
        availability,
        salary,
      }
      await api.put("/talents/profile", payload)
      
      toast.success("Skill deleted successfully")
    } catch (error) {
      console.error("Failed to delete skill:", error)
      toast.error("Failed to delete skill")
    } finally {
      setSavingItem(null)
    }
  }

  const handleAddExperience = async () => {
    setSavingItem("experience")
    try {
      let updatedExperience
      if (editingIndex !== null) {
        updatedExperience = [...experience]
        updatedExperience[editingIndex] = experienceForm
      } else {
        updatedExperience = [...experience, experienceForm]
      }
      
      setExperience(updatedExperience)
      
      // Save to backend
      const payload = {
        skills,
        experience: updatedExperience,
        education,
        availability,
        salary,
      }
      await api.put("/talents/profile", payload)
      
      setShowExperienceModal(false)
      setEditingIndex(null)
      setExperienceForm({ title: "", company: "", startDate: "", endDate: "", description: "" })
      toast.success(editingIndex !== null ? "Experience updated successfully" : "Experience added successfully")
    } catch (error) {
      console.error("Failed to save experience:", error)
      toast.error("Failed to save experience")
    } finally {
      setSavingItem(null)
    }
  }

  const handleEditExperience = (index: number) => {
    setExperienceForm(experience[index])
    setEditingIndex(index)
    setShowExperienceModal(true)
  }

  const handleDeleteExperience = async (index: number) => {
    setSavingItem("experience")
    try {
      const updatedExperience = experience.filter((_, i) => i !== index)
      setExperience(updatedExperience)
      
      // Save to backend
      const payload = {
        skills,
        experience: updatedExperience,
        education,
        availability,
        salary,
      }
      await api.put("/talents/profile", payload)
      
      toast.success("Experience deleted successfully")
    } catch (error) {
      console.error("Failed to delete experience:", error)
      toast.error("Failed to delete experience")
    } finally {
      setSavingItem(null)
    }
  }

  const handleAddEducation = async () => {
    setSavingItem("education")
    try {
      let updatedEducation
      if (editingIndex !== null) {
        updatedEducation = [...education]
        updatedEducation[editingIndex] = educationForm
      } else {
        updatedEducation = [...education, educationForm]
      }
      
      setEducation(updatedEducation)
      
      // Save to backend
      const payload = {
        skills,
        experience,
        education: updatedEducation,
        availability,
        salary,
      }
      await api.put("/talents/profile", payload)
      
      setShowEducationModal(false)
      setEditingIndex(null)
      setEducationForm({ degree: "", institution: "", fieldOfStudy: "", startDate: "", endDate: "", isCurrent: false })
      toast.success(editingIndex !== null ? "Education updated successfully" : "Education added successfully")
    } catch (error) {
      console.error("Failed to save education:", error)
      toast.error("Failed to save education")
    } finally {
      setSavingItem(null)
    }
  }

  const handleEditEducation = (index: number) => {
    setEducationForm(education[index])
    setEditingIndex(index)
    setShowEducationModal(true)
  }

  const handleDeleteEducation = async (index: number) => {
    setSavingItem("education")
    try {
      const updatedEducation = education.filter((_, i) => i !== index)
      setEducation(updatedEducation)
      
      // Save to backend
      const payload = {
        skills,
        experience,
        education: updatedEducation,
        availability,
        salary,
      }
      await api.put("/talents/profile", payload)
      
      toast.success("Education deleted successfully")
    } catch (error) {
      console.error("Failed to delete education:", error)
      toast.error("Failed to delete education")
    } finally {
      setSavingItem(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your professional profile and showcase your skills</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <div className="space-y-6">
              {/* Avatar and CV */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Picture & CV
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar || "/user-avatar.svg"} alt={user?.firstName} />
                      <AvatarFallback className="text-lg">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <FileUpload
                        onUpload={handleAvatarUpload}
                        accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif"] }}
                        className="max-w-sm"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium">Upload Profile Picture</p>
                          <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                        </div>
                      </FileUpload>
                    </div>
                  </div>

                  <CVUpload
                    currentCV={talent?.cv ? {
                      url: talent.cv.url,
                      filename: talent.cv.filename || 'CV.pdf',
                      uploadedAt: talent.cv.uploadedAt || talent.updatedAt || new Date().toISOString()
                    } : undefined}
                    onCVUpdate={(cv) => {
                      setTalent((prev) => prev ? { ...prev, cv: cv } : null)
                    }}
                  />
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={personalInfo.bio}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button onClick={handlePersonalInfoSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Availability & Salary */}
              <Card>
                <CardHeader>
                  <CardTitle>Availability & Salary Expectations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Availability Status</Label>
                      <Select
                        value={availability.status}
                        onValueChange={(value: "available" | "busy" | "unavailable") =>
                          setAvailability((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectItem value="available" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Available</SelectItem>
                          <SelectItem value="busy" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Busy</SelectItem>
                          <SelectItem value="unavailable" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Available From</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={availability.startDate}
                        onChange={(e) => setAvailability((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                      <Input
                        id="hoursPerWeek"
                        type="number"
                        value={availability.hoursPerWeek}
                        onChange={(e) =>
                          setAvailability((prev) => ({ ...prev, hoursPerWeek: Number.parseInt(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minSalary">Minimum Salary</Label>
                      <Input
                        id="minSalary"
                        type="number"
                        value={salary.minAmount}
                        onChange={(e) => setSalary((prev) => ({ ...prev, minAmount: Number.parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxSalary">Maximum Salary</Label>
                      <Input
                        id="maxSalary"
                        type="number"
                        value={salary.maxAmount}
                        onChange={(e) => setSalary((prev) => ({ ...prev, maxAmount: Number.parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={salary.currency}
                        onValueChange={(value) => setSalary((prev) => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectItem value="USD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">USD</SelectItem>
                          <SelectItem value="EUR" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">EUR</SelectItem>
                          <SelectItem value="GBP" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">GBP</SelectItem>
                          <SelectItem value="NGN" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">NGN</SelectItem>
                          <SelectItem value="ZAR" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">ZAR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleTalentProfileSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Skills
                    </CardTitle>
                    <CardDescription>Add your technical and soft skills</CardDescription>
                  </div>
                  <Dialog open={showSkillModal} onOpenChange={setShowSkillModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">{editingIndex !== null ? "Edit Skill" : "Add New Skill"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="skillName" className="text-gray-900 dark:text-white font-medium">Skill Name</Label>
                          <Input
                            id="skillName"
                            value={skillForm.name}
                            onChange={(e) => setSkillForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Solidity, React, Project Management"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-900 dark:text-white font-medium">Proficiency Level</Label>
                          <Select
                            value={skillForm.level}
                            onValueChange={(value: "beginner" | "intermediate" | "advanced" | "expert") =>
                              setSkillForm((prev) => ({ ...prev, level: value }))
                            }
                          >
                            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                              <SelectItem value="beginner" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Beginner</SelectItem>
                              <SelectItem value="intermediate" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Intermediate</SelectItem>
                              <SelectItem value="advanced" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Advanced</SelectItem>
                              <SelectItem value="expert" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="yearsOfExperience" className="text-gray-900 dark:text-white font-medium">Years of Experience</Label>
                          <Input
                            id="yearsOfExperience"
                            type="number"
                            min="0"
                            value={skillForm.yearsOfExperience}
                            onChange={(e) =>
                              setSkillForm((prev) => ({ ...prev, yearsOfExperience: Number.parseInt(e.target.value) }))
                            }
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowSkillModal(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            Cancel
                          </Button>
                          <Button onClick={handleAddSkill} disabled={savingItem === "skill"} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {savingItem === "skill" ? "Saving..." : (editingIndex !== null ? "Update" : "Add") + " Skill"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <div className="space-y-4">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Badge variant="outline">{skill.level}</Badge>
                              <span>{skill.yearsOfExperience} years experience</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditSkill(index)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSkill(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
                    <p className="text-gray-600">Add your skills to showcase your expertise</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Work Experience
                    </CardTitle>
                    <CardDescription>Add your professional work experience</CardDescription>
                  </div>
                  <Dialog open={showExperienceModal} onOpenChange={setShowExperienceModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">{editingIndex !== null ? "Edit Experience" : "Add Work Experience"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="jobTitle" className="text-gray-900 dark:text-white font-medium">Job Title</Label>
                            <Input
                              id="jobTitle"
                              value={experienceForm.title}
                              onChange={(e) => setExperienceForm((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g., Senior Blockchain Developer"
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company" className="text-gray-900 dark:text-white font-medium">Company</Label>
                            <Input
                              id="company"
                              value={experienceForm.company}
                              onChange={(e) => setExperienceForm((prev) => ({ ...prev, company: e.target.value }))}
                              placeholder="e.g., TechCorp Inc."
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-gray-900 dark:text-white font-medium">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={experienceForm.startDate}
                              onChange={(e) => setExperienceForm((prev) => ({ ...prev, startDate: e.target.value }))}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-gray-900 dark:text-white font-medium">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={experienceForm.endDate}
                              onChange={(e) => setExperienceForm((prev) => ({ ...prev, endDate: e.target.value }))}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Leave empty if current position</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-gray-900 dark:text-white font-medium">Description</Label>
                          <Textarea
                            id="description"
                            rows={4}
                            value={experienceForm.description}
                            onChange={(e) => setExperienceForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your responsibilities and achievements..."
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowExperienceModal(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            Cancel
                          </Button>
                          <Button onClick={handleAddExperience} disabled={savingItem === "experience"} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {savingItem === "experience" ? "Saving..." : (editingIndex !== null ? "Update" : "Add") + " Experience"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {experience.length > 0 ? (
                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{exp.title}</h4>
                          <p className="text-secondary font-medium">{exp.company}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(exp.startDate).toLocaleDateString()} -{" "}
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                          </p>
                          <p className="text-sm text-gray-700">{exp.description}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => handleEditExperience(index)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteExperience(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No experience added yet</h3>
                    <p className="text-gray-600">Add your work experience to build credibility</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Education
                    </CardTitle>
                    <CardDescription>Add your educational background</CardDescription>
                  </div>
                  <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">{editingIndex !== null ? "Edit Education" : "Add Education"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="degree" className="text-gray-900 dark:text-white font-medium">Degree</Label>
                          <Input
                            id="degree"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm((prev) => ({ ...prev, degree: e.target.value }))}
                            placeholder="e.g., Bachelor of Science"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="institution" className="text-gray-900 dark:text-white font-medium">Institution</Label>
                          <Input
                            id="institution"
                            value={educationForm.institution}
                            onChange={(e) => setEducationForm((prev) => ({ ...prev, institution: e.target.value }))}
                            placeholder="e.g., University of Lagos"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fieldOfStudy" className="text-gray-900 dark:text-white font-medium">Field of Study</Label>
                          <Input
                            id="fieldOfStudy"
                            value={educationForm.fieldOfStudy}
                            onChange={(e) => setEducationForm((prev) => ({ ...prev, fieldOfStudy: e.target.value }))}
                            placeholder="e.g., Computer Science"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-gray-900 dark:text-white font-medium">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={educationForm.startDate}
                              onChange={(e) => setEducationForm((prev) => ({ ...prev, startDate: e.target.value }))}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-gray-900 dark:text-white font-medium">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={educationForm.endDate}
                              onChange={(e) => setEducationForm((prev) => ({ ...prev, endDate: e.target.value }))}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Leave empty if current education</p>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowEducationModal(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            Cancel
                          </Button>
                          <Button onClick={handleAddEducation} disabled={savingItem === "education"} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {savingItem === "education" ? "Saving..." : (editingIndex !== null ? "Update" : "Add") + " Education"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {education.length > 0 ? (
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-secondary font-medium">{edu.institution}</p>
                          <p className="text-sm text-gray-600">
                            {edu.fieldOfStudy} • {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => handleEditEducation(index)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEducation(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No education added yet</h3>
                    <p className="text-gray-600">Add your educational background</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
