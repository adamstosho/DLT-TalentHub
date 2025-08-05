"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"
import { ArrowLeft, Eye, Users, Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle, Mail, ExternalLink, Building, Briefcase, FileText, MessageSquare, Star, Download } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface Application {
  _id: string
  jobId: string
  talentId: string
  job?: {
    _id: string
    title: string
    company: {
      name: string
      logo?: string
    }
    location: {
      city: string
      country: string
      remote: boolean
    }
    type: string
    salary: {
      min: number
      max: number
      currency: string
    }
  }
  applicant?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    location?: string
    phone?: string
    bio?: string
  }
  status: string
  coverLetter: string
  expectedSalary?: {
    amount: number
    currency: string
  }
  availability?: {
    startDate: string
    hoursPerWeek: number
  }
  notes?: string
  createdAt: string
  updatedAt: string
  resume?: {
    url?: string
  }
}

interface TalentProfile {
  skills: Array<{
    name: string
    level: string
    yearsOfExperience: number
  }>
  experience: Array<{
    title: string
    company: string
    location?: string
    startDate: string
    endDate?: string
    isCurrent?: boolean
    description?: string
  }>
  education: Array<{
    degree: string
    institution: string
    fieldOfStudy: string
    startDate: string
    endDate?: string
    isCurrent?: boolean
    grade?: string
  }>
  availability: {
    status: string
    noticePeriod?: number
    preferredWorkType?: string[]
    remotePreference?: string
  }
  salary: {
    currency: string
    minAmount: number
    maxAmount: number
    period: string
  }
}

export default function RecruiterApplicationDetails() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  // Utility function to safely format dates
  const formatDate = (dateString: string | undefined, options?: Intl.DateTimeFormatOptions) => {
    if (!dateString) return 'Invalid Date'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString('en-US', options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Invalid Date'
    }
  }

  // Utility function to calculate days since a date
  const getDaysSince = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      const days = Math.ceil((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      return days < 0 ? 0 : days
    } catch (error) {
      console.error('Error calculating days since:', dateString, error)
      return 'N/A'
    }
  }

  const [application, setApplication] = useState<Application | null>(null)
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState("")
  const [notes, setNotes] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails()
    }
  }, [applicationId])

  const fetchApplicationDetails = async () => {
    try {
      // Since there's no individual application endpoint, we'll fetch all applications
      // and find the one we need. This is a workaround until the backend provides
      // an individual application endpoint.
      const response = await api.get(`/recruiters/applications`)
      const allApplications = response.data.data.applications
      const foundApplication = allApplications.find((app: any) => app._id === applicationId)
      
      if (foundApplication) {
        setApplication(foundApplication)
        
        // Fetch talent profile if available
        if (foundApplication.applicant?._id) {
          try {
            const talentResponse = await api.get(`/talents/${foundApplication.applicant._id}`)
            setTalentProfile(talentResponse.data.data.talent)
          } catch (error: any) {
            // Handle 404 errors gracefully - talent profile not found
            if (error.response?.status === 404) {
              console.log("Talent profile not found - talent may have been deleted")
            } else {
              console.error("Failed to fetch talent profile:", error)
            }
            // Don't set talentProfile, it will remain null and show "not available" message
          }
        }
      } else {
        toast.error("Application not found")
      }
    } catch (error) {
      console.error("Failed to fetch application details:", error)
      toast.error("Failed to load application details")
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async () => {
    if (!statusUpdate) {
      toast.error("Please select a status")
      return
    }

    setUpdatingStatus(true)
    try {
      await api.put(`/jobs/applications/${applicationId}/status`, {
        status: statusUpdate,
        notes: notes
      })

      // Update local state
      if (application) {
        setApplication({
          ...application,
          status: statusUpdate,
          notes: notes
        })
      }

      toast.success("Application status updated successfully")
      setShowStatusModal(false)
      setStatusUpdate("")
      setNotes("")
    } catch (error) {
      console.error("Failed to update application status:", error)
      toast.error("Failed to update application status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleContactApplicant = async () => {
    if (!contactMessage.trim()) {
      toast.error("Please enter a message")
      return
    }

    setSendingMessage(true)
    try {
      // This would be implemented when messaging API is available
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Message sent successfully!")
      setShowContactModal(false)
      setContactMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "shortlisted":
        return "bg-purple-100 text-purple-800"
      case "interviewed":
        return "bg-indigo-100 text-indigo-800"
      case "offered":
        return "bg-orange-100 text-orange-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const downloadResume = () => {
    if (application?.resume?.url) {
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = application.resume.url
      link.download = `resume_${application.applicant?.firstName || 'applicant'}_${application.applicant?.lastName || 'resume'}.pdf`
      link.target = '_blank'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Resume download started")
    } else {
      toast.error("Resume not available for download")
    }
  }

  const openProfileModal = async () => {
    if (!application?.applicant?._id) {
      toast.error("Applicant information not available")
      return
    }

    setShowProfileModal(true)
    setLoadingProfile(true)

    try {
      const response = await api.get(`/talents/${application.applicant._id}`)
      setTalentProfile(response.data.data.talent)
    } catch (error: any) {
      console.error("Failed to fetch talent profile:", error)
      if (error.response?.status === 404) {
        toast.error("Talent profile not found")
      } else {
        toast.error("Failed to load talent profile")
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
            <p className="text-gray-600 mb-4">The application you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/recruiter/applications")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.push("/recruiter/applications")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary">
                Application Review
              </h1>
              <p className="text-gray-600">
                {application.job?.title || 'Job Title'} at {application.job?.company.name || 'Company'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
              <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Application Status</DialogTitle>
                    <DialogDescription>
                      Change the status of this application
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">New Status</Label>
                      <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending Review</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="interviewed">Interviewed</SelectItem>
                          <SelectItem value="offered">Offered</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about this application..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={updateApplicationStatus} disabled={updatingStatus}>
                        {updatingStatus ? "Updating..." : "Update Status"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Application Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg lg:text-2xl font-bold truncate">
                    {formatDate(application.createdAt)}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600">Applied Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg lg:text-2xl font-bold">
                    {getDaysSince(application.createdAt)}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600">Days Since Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg lg:text-2xl font-bold">
                    PDF
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600">Resume Format</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg lg:text-2xl font-bold truncate">
                    {application.applicant?.location || "Not specified"}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600">Applicant Location</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Application Overview</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">Candidate Profile</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Application Details */}
              <div className="xl:col-span-2 space-y-6">
                {/* Applicant Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Applicant Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                        <AvatarImage src={application.applicant?.avatar} />
                        <AvatarFallback>
                          {application.applicant?.firstName?.[0] || 'A'}
                          {application.applicant?.lastName?.[0] || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-semibold">
                          {application.applicant?.firstName || 'Applicant'} {application.applicant?.lastName || 'Name'}
                        </h3>
                        <p className="text-gray-600">{application.applicant?.email || 'email@example.com'}</p>
                        {application.applicant?.phone && (
                          <p className="text-gray-600">{application.applicant.phone}</p>
                        )}
                        {application.applicant?.location && (
                          <p className="text-gray-600">{application.applicant.location}</p>
                        )}
                        {application.applicant?.bio && (
                          <p className="text-gray-700 mt-2">{application.applicant.bio}</p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 sm:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactModal(true)}
                          className="w-full sm:w-auto"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cover Letter */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{application.job?.company.name || 'Company'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{application.job?.title || 'Job Title'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {application.job?.location ? `${application.job.location.city}, ${application.job.location.country}` : 'Location not specified'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {application.job?.salary ? `${application.job.salary.currency} ${application.job.salary.min.toLocaleString()} - ${application.job.salary.max.toLocaleString()}` : 'Salary not specified'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={downloadResume}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                    <Button 
                      className="mt-2 w-full justify-start" 
                      variant="outline"
                      onClick={openProfileModal}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Application Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Application Submitted</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(application.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Status Updated</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(application.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {talentProfile ? (
              <div className="space-y-6">
                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {talentProfile.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{skill.name}</p>
                            <p className="text-sm text-gray-600">{skill.level}</p>
                          </div>
                          <Badge variant="secondary">
                            {skill.yearsOfExperience} years
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {talentProfile.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <h4 className="font-medium">{exp.title}</h4>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          {exp.location && (
                            <p className="text-sm text-gray-500">{exp.location}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatDate(exp.startDate, { year: 'numeric', month: 'short' })} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate, { year: 'numeric', month: 'short' })}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {talentProfile.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">{edu.fieldOfStudy}</p>
                          <p className="text-xs text-gray-500">
                            {edu.startDate ? new Date(edu.startDate).getFullYear() : 'Invalid'} - {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Availability & Salary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status</span>
                          <Badge className={getStatusColor(talentProfile.availability.status)}>
                            {talentProfile.availability.status}
                          </Badge>
                        </div>
                        {talentProfile.availability.noticePeriod && (
                          <div className="flex justify-between">
                            <span>Notice Period</span>
                            <span>{talentProfile.availability.noticePeriod} days</span>
                          </div>
                        )}
                        {talentProfile.availability.remotePreference && (
                          <div className="flex justify-between">
                            <span>Remote Preference</span>
                            <span>{talentProfile.availability.remotePreference}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Salary Expectations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Range</span>
                          <span>
                            {talentProfile.salary.currency} {talentProfile.salary.minAmount.toLocaleString()} - {talentProfile.salary.maxAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Period</span>
                          <span>{talentProfile.salary.period}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Talent profile not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
                <CardDescription>
                  Download and review the applicant's resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">Resume.pdf</p>
                      <p className="text-sm text-gray-600">
                        Uploaded {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={downloadResume}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

                 {/* Contact Modal */}
         <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle>
                 Contact {application.applicant?.firstName || 'Applicant'} {application.applicant?.lastName || 'Name'}
               </DialogTitle>
               <DialogDescription>
                 Send a message to the applicant
               </DialogDescription>
             </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Hi, I'm reviewing your application..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowContactModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleContactApplicant} disabled={sendingMessage}>
                  <Mail className="h-4 w-4 mr-2" />
                  {sendingMessage ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Talent Profile Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {application?.applicant?.firstName} {application?.applicant?.lastName} - Profile
              </DialogTitle>
              <DialogDescription>
                View the talent's complete profile
              </DialogDescription>
            </DialogHeader>
            
            {loadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading profile...</span>
              </div>
            ) : talentProfile ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={application?.applicant?.avatar} />
                    <AvatarFallback>
                      {application?.applicant?.firstName?.[0]}
                      {application?.applicant?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {application?.applicant?.firstName} {application?.applicant?.lastName}
                    </h3>
                    <p className="text-gray-600">{application?.applicant?.email}</p>
                    {application?.applicant?.location && (
                      <p className="text-gray-500">{application.applicant.location}</p>
                    )}
                    {application?.applicant?.bio && (
                      <p className="text-sm text-gray-600 mt-2">{application.applicant.bio}</p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {talentProfile.skills && talentProfile.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Skills</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {talentProfile.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{skill.name}</p>
                            <p className="text-sm text-gray-600">{skill.level}</p>
                          </div>
                          <Badge variant="secondary">
                            {skill.yearsOfExperience} years
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {talentProfile.experience && talentProfile.experience.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Experience</h4>
                    <div className="space-y-4">
                      {talentProfile.experience.map((exp, index) => (
                        <div key={index} className="border-l-4 border-primary pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{exp.title}</p>
                              <p className="text-gray-600">{exp.company}</p>
                              {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                            </div>
                            <Badge variant="outline">
                              {exp.isCurrent ? 'Current' : `${new Date(exp.startDate).getFullYear()} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}`}
                            </Badge>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {talentProfile.education && talentProfile.education.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Education</h4>
                    <div className="space-y-4">
                      {talentProfile.education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-gray-600">{edu.institution}</p>
                              <p className="text-sm text-gray-500">{edu.fieldOfStudy}</p>
                              {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                            </div>
                            <Badge variant="outline">
                              {edu.isCurrent ? 'Current' : `${new Date(edu.startDate).getFullYear()} - ${edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}`}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability & Salary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {talentProfile.availability && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Availability</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="secondary">{talentProfile.availability.status}</Badge>
                        </div>
                        {talentProfile.availability.noticePeriod && (
                          <div className="flex justify-between">
                            <span>Notice Period:</span>
                            <span>{talentProfile.availability.noticePeriod} days</span>
                          </div>
                        )}
                        {talentProfile.availability.remotePreference && (
                          <div className="flex justify-between">
                            <span>Remote Preference:</span>
                            <span>{talentProfile.availability.remotePreference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {talentProfile.salary && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Salary Expectations</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Range:</span>
                          <span>
                            {talentProfile.salary.currency} {talentProfile.salary.minAmount.toLocaleString()} - {talentProfile.salary.maxAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Period:</span>
                          <span>{talentProfile.salary.period}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Talent profile not available</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 