"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"
import type { JobCreateRequest } from "@/types/job"
import { Plus, X, Building, MapPin, DollarSign, FileText, Settings } from "lucide-react"
import toast from "react-hot-toast"

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [jobData, setJobData] = useState<JobCreateRequest>({
    title: "",
    description: "",
    company: {
      name: "",
      logo: {
        url: "",
        public_id: ""
      },
      website: "",
    },
    type: "full-time",
    category: "",
    skills: [],
    requirements: [],
    responsibilities: [],
    location: {
      type: "onsite",
      city: "",
      country: "",
      address: "",
    },
    salary: {
      min: 0,
      max: 0,
      currency: "USD",
      period: "monthly",
    },
    experience: {
      min: 0,
      max: 0,
      level: "entry"
    },
    isUrgent: false,
    isFeatured: false,
  })

  const [skillInput, setSkillInput] = useState("")
  const [requirementInput, setRequirementInput] = useState("")
  const [responsibilityInput, setResponsibilityInput] = useState("")

  const jobTypes = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
  ]

  const categories = ["Development", "Design", "Marketing", "Sales", "Management", "Finance", "Operations", "Other"]

  const currencies = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "NGN", label: "NGN" },
    { value: "ZAR", label: "ZAR" },
  ]

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const parts = field.split(".")
      if (parts.length === 2) {
        const [parent, child] = parts
        setJobData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof JobCreateRequest],
            [child]: value,
          },
        }))
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts
        setJobData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof JobCreateRequest],
            [child]: {
              ...prev[parent as keyof JobCreateRequest]?.[child],
              [grandchild]: value,
            },
          },
        }))
      }
    } else {
      setJobData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !jobData.skills.includes(skillInput.trim())) {
      setJobData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setJobData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addRequirement = () => {
    if (requirementInput.trim() && !jobData.requirements.includes(requirementInput.trim())) {
      setJobData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()],
      }))
      setRequirementInput("")
    }
  }

  const removeRequirement = (requirement: string) => {
    setJobData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r !== requirement),
    }))
  }

  const addResponsibility = () => {
    if (responsibilityInput.trim() && !jobData.responsibilities.includes(responsibilityInput.trim())) {
      setJobData((prev) => ({
        ...prev,
        responsibilities: [...prev.responsibilities, responsibilityInput.trim()],
      }))
      setResponsibilityInput("")
    }
  }

  const removeResponsibility = (responsibility: string) => {
    setJobData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((r) => r !== responsibility),
    }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return jobData.title && jobData.company?.name && jobData.type && jobData.category
      case 2:
        return jobData.description && jobData.skills.length > 0 && jobData.requirements.length > 0
      case 3:
        return jobData.salary.min > 0 && jobData.salary.max > 0 && jobData.salary.period
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (isDraft = false) => {
    setLoading(true)
    try {
      // Clean up the payload - remove empty strings from location
      const cleanLocation = {
        type: jobData.location.type,
        ...(jobData.location.city && jobData.location.city.trim() && { city: jobData.location.city.trim() }),
        ...(jobData.location.country && jobData.location.country.trim() && { country: jobData.location.country.trim() }),
        ...(jobData.location.address && jobData.location.address.trim() && { address: jobData.location.address.trim() })
      };

      const payload = {
        ...jobData,
        location: cleanLocation,
        status: isDraft ? "draft" : "active",
      }

      // Log the payload for debugging
      console.log('Job submission payload:', JSON.stringify(payload, null, 2))

      const response = await api.post("/jobs", payload)
      toast.success(`Job ${isDraft ? "saved as draft" : "posted"} successfully!`)
      router.push("/recruiter/jobs")
    } catch (error: any) {
      console.error('Job submission error:', error.response?.data)
      
      // Handle detailed validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((err: any) => 
          `${err.field}: ${err.message}`
        ).join('\n')
        toast.error(`Validation errors:\n${errorMessages}`)
      } else {
        toast.error(error.response?.data?.message || "Failed to post job")
      }
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: "Basic Information", icon: Building },
    { number: 2, title: "Job Details", icon: FileText },
    { number: 3, title: "Compensation & Location", icon: DollarSign },
    { number: 4, title: "Review & Publish", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Post a New Job</h1>
          <p className="text-gray-600">Find the perfect talent for your team</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? "bg-secondary border-secondary text-primary"
                        : isActive
                          ? "border-secondary text-secondary"
                          : "border-gray-300 text-gray-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-secondary" : isCompleted ? "text-primary" : "text-gray-400"
                      }`}
                    >
                      Step {step.number}
                    </p>
                    <p
                      className={`text-xs ${
                        isActive ? "text-secondary" : isCompleted ? "text-primary" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${isCompleted ? "bg-secondary" : "bg-gray-300"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  <p className="text-gray-600 mb-6">Let's start with the basics about your job posting</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={jobData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Senior Blockchain Developer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={jobData.company?.name || ""}
                        onChange={(e) => handleInputChange("company.name", e.target.value)}
                        placeholder="e.g., DLT-AFRICA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website</Label>
                      <Input
                        id="companyWebsite"
                        value={jobData.company?.website || ""}
                        onChange={(e) => handleInputChange("company.website", e.target.value)}
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Type *</Label>
                      <Select value={jobData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={jobData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Job Details</h2>
                  <p className="text-gray-600 mb-6">Provide detailed information about the role</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      rows={8}
                      value={jobData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Required Skills *</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Add a skill"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {jobData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                                          <div>
                        <Label>Requirements *</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={requirementInput}
                            onChange={(e) => setRequirementInput(e.target.value)}
                            placeholder="Add a requirement"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                          />
                          <Button type="button" onClick={addRequirement}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mt-3">
                          {jobData.requirements.map((requirement, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{requirement}</span>
                              <X
                                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                onClick={() => removeRequirement(requirement)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Responsibilities</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={responsibilityInput}
                            onChange={(e) => setResponsibilityInput(e.target.value)}
                            placeholder="Add a responsibility"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                          />
                          <Button type="button" onClick={addResponsibility}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mt-3">
                          {jobData.responsibilities.map((responsibility, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{responsibility}</span>
                              <X
                                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                onClick={() => removeResponsibility(responsibility)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Compensation & Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Compensation & Location</h2>
                  <p className="text-gray-600 mb-6">Set the salary range and location details</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-4 block">Salary Range *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minSalary">Minimum Salary</Label>
                        <Input
                          id="minSalary"
                          type="number"
                          value={jobData.salary.min || ""}
                          onChange={(e) => handleInputChange("salary.min", e.target.value ? Number(e.target.value) : 0)}
                          placeholder="50000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxSalary">Maximum Salary</Label>
                        <Input
                          id="maxSalary"
                          type="number"
                          value={jobData.salary.max || ""}
                          onChange={(e) => handleInputChange("salary.max", e.target.value ? Number(e.target.value) : 0)}
                          placeholder="80000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={jobData.salary.currency}
                          onValueChange={(value) => handleInputChange("salary.currency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Salary Period</Label>
                        <Select
                          value={jobData.salary.period || "monthly"}
                          onValueChange={(value) => handleInputChange("salary.period", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium mb-4 block">Experience Requirements</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minExperience">Minimum Experience (years)</Label>
                        <Input
                          id="minExperience"
                          type="number"
                          value={jobData.experience?.min || ""}
                          onChange={(e) => handleInputChange("experience.min", e.target.value ? Number(e.target.value) : 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxExperience">Maximum Experience (years)</Label>
                        <Input
                          id="maxExperience"
                          type="number"
                          value={jobData.experience?.max || ""}
                          onChange={(e) => handleInputChange("experience.max", e.target.value ? Number(e.target.value) : 0)}
                          placeholder="5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select
                          value={jobData.experience?.level || "entry"}
                          onValueChange={(value) => handleInputChange("experience.level", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid Level</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium mb-4 block">Location</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="locationType">Location Type</Label>
                        <Select value={jobData.location.type} onValueChange={(value) => handleInputChange("location.type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="onsite">On-site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {jobData.location.type !== "remote" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={jobData.location.city}
                              onChange={(e) => handleInputChange("location.city", e.target.value)}
                              placeholder="e.g., Lagos"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={jobData.location.country}
                              onChange={(e) => handleInputChange("location.country", e.target.value)}
                              placeholder="e.g., Nigeria"
                            />
                          </div>
                        </div>
                      )}

                      {jobData.location.type === "onsite" && (
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={jobData.location.address}
                            onChange={(e) => handleInputChange("location.address", e.target.value)}
                            placeholder="Full address"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium mb-4 block">Additional Options</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="urgent"
                          checked={jobData.isUrgent}
                          onCheckedChange={(checked) => handleInputChange("isUrgent", checked)}
                        />
                        <Label htmlFor="urgent">Mark as urgent hiring</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={jobData.isFeatured}
                          onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                        />
                        <Label htmlFor="featured">Feature this job (premium)</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Publish */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Review & Publish</h2>
                  <p className="text-gray-600 mb-6">Review your job posting before publishing</p>
                </div>

                <div className="space-y-6">
                  {/* Job Preview */}
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{jobData.title}</CardTitle>
                          <CardDescription className="text-base">{jobData.company?.name || "Company"}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge>{jobData.type.replace("-", " ")}</Badge>
                          <Badge variant="outline">{jobData.category}</Badge>
                          {jobData.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                          {jobData.isFeatured && <Badge className="bg-secondary text-primary">Featured</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                                              <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {jobData.location.type === "remote" ? "Remote" : 
                             jobData.location.type === "hybrid" ? "Hybrid" :
                             `${jobData.location.city}, ${jobData.location.country}`}
                          </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {jobData.salary.min > 0 && jobData.salary.max > 0 ? (
                            `${jobData.salary.currency} ${jobData.salary.min.toLocaleString()} - ${jobData.salary.max.toLocaleString()} / ${jobData.salary.period || 'monthly'}`
                          ) : (
                            "Salary not specified"
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{jobData.description}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {jobData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {jobData.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {jobData.responsibilities && jobData.responsibilities.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Responsibilities</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {jobData.responsibilities.map((responsibility, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{responsibility}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Experience Requirements</h4>
                        <p className="text-sm text-gray-700">
                          {jobData.experience?.min || 0} - {jobData.experience?.max || 0} years 
                          ({jobData.experience?.level || 'entry'} level)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                {currentStep === 4 ? (
                  <>
                    <Button variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
                      Save as Draft
                    </Button>
                    <Button onClick={() => handleSubmit(false)} disabled={loading}>
                      {loading ? "Publishing..." : "Publish Job"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
