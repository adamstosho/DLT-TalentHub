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
import { ArrowLeft, Edit, Eye, Users, Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle, Mail, ExternalLink, Building, Briefcase } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface Job {
  _id: string
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  company: {
    name: string
    logo?: string
    website?: string
  }
  location: {
    type: string
    city: string
    country: string
    address?: string
  }
  type: string
  category: string
  salary: {
    min: number
    max: number
    currency: string
  }
  experience?: string
  education?: string
  skills: string[]
  benefits?: string[]
  status: string
  isUrgent: boolean
  isFeatured: boolean
  applications: {
    total: number
    shortlisted: number
    rejected: number
    pending: number
  }
  views: number
  createdAt: string
  updatedAt: string
}

interface Application {
  _id: string
  applicant: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    location?: string
  }
  status: string
  coverLetter: string
  resume: {
    url: string
    filename: string
  }
  appliedAt: string
  lastUpdated: string
}

export default function RecruiterJobDetails() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState("")
  const [notes, setNotes] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (jobId) {
      fetchJobDetails()
      fetchJobApplications()
    }
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`)
      setJob(response.data.data.job)
    } catch (error) {
      console.error("Failed to fetch job details:", error)
      toast.error("Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  const fetchJobApplications = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/applications`)
      setApplications(response.data.data.applications)
    } catch (error) {
      console.error("Failed to fetch applications:", error)
      toast.error("Failed to load applications")
    }
  }

  const updateApplicationStatus = async () => {
    if (!selectedApplication || !statusUpdate) {
      toast.error("Please select a status")
      return
    }

    setUpdatingStatus(true)
    try {
      await api.put(`/applications/${selectedApplication._id}/status`, {
        status: statusUpdate,
        notes: notes
      })

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app._id === selectedApplication._id 
            ? { ...app, status: statusUpdate }
            : app
        )
      )

      toast.success("Application status updated successfully")
      setShowApplicationModal(false)
      setStatusUpdate("")
      setNotes("")
      setSelectedApplication(null)
    } catch (error) {
      console.error("Failed to update application status:", error)
      toast.error("Failed to update application status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "hired":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const openApplicationModal = (application: Application) => {
    setSelectedApplication(application)
    setShowApplicationModal(true)
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

  if (!job) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/recruiter/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
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
          <div className="flex lg:flex-row flex-col md:items-center items-start gap-4 mb-4">
            <Button variant="outline" onClick={() => router.push("/recruiter/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary">{job.title}</h1>
              <p className="text-gray-600">{job.company.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(job.status)}>
                {job.status}
              </Badge>
              <Link href={`/recruiter/jobs/${jobId}/edit` as any}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Job Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{job.applications.total}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{applications.filter(app => app.status === 'shortlisted').length}</p>
                  <p className="text-sm text-gray-600">Shortlisted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{applications.filter(app => app.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{job.views}</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Job Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Job Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index} className="text-gray-700">{resp}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {job.benefits && job.benefits.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {job.benefits.map((benefit, index) => (
                          <li key={index} className="text-gray-700">{benefit}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Job Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{job.company.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {job.location.city}, {job.location.country}
                        {job.location.type === 'remote' && " (Remote)"}
                        {job.location.type === 'hybrid' && " (Hybrid)"}
                        {job.location.type === 'onsite' && " (On-site)"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{job.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Job Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {job.location.type === 'remote' && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Remote Work</span>
                      </div>
                    )}
                    {job.isUrgent && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Urgent Position</span>
                      </div>
                    )}
                    {job.isFeatured && (
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Featured Job</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>
                  Review and manage applications for this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={application.applicant.avatar} />
                            <AvatarFallback>
                              {application.applicant.firstName[0]}
                              {application.applicant.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {application.applicant.firstName} {application.applicant.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{application.applicant.email}</p>
                            {application.applicant.location && (
                              <p className="text-sm text-gray-500">{application.applicant.location}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getApplicationStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApplicationModal(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for this job posting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Application Status Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Pending Review</span>
                        <span className="font-medium">{applications.filter(app => app.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shortlisted</span>
                        <span className="font-medium">{applications.filter(app => app.status === 'shortlisted').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rejected</span>
                        <span className="font-medium">{applications.filter(app => app.status === 'rejected').length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Performance Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Views</span>
                        <span className="font-medium">{job.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Application Rate</span>
                        <span className="font-medium">
                          {job.views > 0 ? ((job.applications.total / job.views) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days Active</span>
                        <span className="font-medium">
                          {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Review Modal */}
        <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Review Application - {selectedApplication?.applicant.firstName} {selectedApplication?.applicant.lastName}
              </DialogTitle>
              <DialogDescription>
                Review the application and update the status
              </DialogDescription>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Applicant Info */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedApplication.applicant.avatar} />
                    <AvatarFallback>
                      {selectedApplication.applicant.firstName[0]}
                      {selectedApplication.applicant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedApplication.applicant.email}</p>
                    {selectedApplication.applicant.location && (
                      <p className="text-gray-500">{selectedApplication.applicant.location}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Applied {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h4 className="font-semibold mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>

                {/* Resume */}
                <div>
                  <h4 className="font-semibold mb-2">Resume</h4>
                  <a
                    href={selectedApplication.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{selectedApplication.resume?.filename}</span>
                  </a>
                </div>

                {/* Status Update */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Update Status</Label>
                    <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
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
                    <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={updateApplicationStatus} disabled={updatingStatus}>
                      {updatingStatus ? "Updating..." : "Update Status"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 