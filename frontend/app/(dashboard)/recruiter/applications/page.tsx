"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/ui/pagination"
import api from "@/lib/api"
import Link from "next/link"

import type { Pagination as PaginationType } from "@/types/common"
import toast from "react-hot-toast"
import { 
  Briefcase, 
  Users, 
  Filter, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Download,
  Calendar,
  MapPin,

} from "lucide-react"

interface Application {
  _id: string
  job: {
    _id: string
    title: string
    company: {
      name: string
    }
  }
  applicant: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  status: string
  createdAt: string
  coverLetter?: string
  expectedSalary?: {
    amount: number
    currency: string
    period: string
  }
  availability?: {
    startDate: string
    noticePeriod: number
  }
}



export default function RecruiterApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedJob, setSelectedJob] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [jobs, setJobs] = useState<Array<{ _id: string; title: string }>>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)


  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interviewed", label: "Interviewed" },
    { value: "offered", label: "Offered" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" }
  ]

  const fetchApplications = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      })

      if (selectedStatus !== "all") params.append("status", selectedStatus)
      if (selectedJob !== "all") params.append("jobId", selectedJob)
      if (searchQuery) params.append("search", searchQuery)

      const response = await api.get(`/recruiters/applications?${params.toString()}`)
      setApplications(response.data.data.applications)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await api.get("/recruiters/jobs")
      setJobs(response.data.data.jobs)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchApplications()
      fetchJobs()
    }
  }, [user, selectedStatus, selectedJob, searchQuery])

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
        return "bg-green-100 text-green-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleUpdateStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    setUpdatingStatus(applicationId)
    try {
      await api.put(`/jobs/applications/${applicationId}/status`, {
        status: newStatus,
        notes: notes || `Status updated to ${newStatus}`
      })
      
      // Refresh applications
      await fetchApplications(pagination?.page || 1)
      
      alert(`Application ${newStatus} successfully!`)
    } catch (error) {
      console.error("Failed to update application status:", error)
      alert("Failed to update application status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "shortlisted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }



  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Applications Management</h1>
          <p className="text-gray-600">Review and manage job applications from candidates</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search applicants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Job</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedStatus("all")
                    setSelectedJob("all")
                    setSearchQuery("")
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({pagination?.total || 0})</CardTitle>
            <CardDescription>
              Showing {applications.length} of {pagination?.total || 0} applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.applicant.avatar} />
                          <AvatarFallback>
                            {`${application.applicant.firstName} ${application.applicant.lastName}`
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {application.applicant.firstName} {application.applicant.lastName}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1">{application.status}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-1">
                            Applied for <strong>{application.job.title}</strong> at {application.job.company.name}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Applied {formatDate(application.createdAt)}
                            </span>
                            {application.expectedSalary && (
                              <span>
                                Expected: {application.expectedSalary.currency} {application.expectedSalary.amount.toLocaleString()} / {application.expectedSalary.period}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedApplication(application)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-gray-900 dark:text-white font-semibold">Application Details</DialogTitle>
                                <DialogDescription className="text-gray-600 dark:text-gray-300">
                                  Review application from {application.applicant.firstName} {application.applicant.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={application.applicant.avatar} />
                                    <AvatarFallback>
                                      {`${application.applicant.firstName} ${application.applicant.lastName}`
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {application.applicant.firstName} {application.applicant.lastName}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">{application.applicant.email}</p>
                                    <Badge className={getStatusColor(application.status)}>
                                      {application.status}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Job Details</h4>
                                  <p className="text-gray-700 dark:text-gray-300"><strong>Position:</strong> {application.job.title}</p>
                                  <p className="text-gray-700 dark:text-gray-300"><strong>Company:</strong> {application.job.company.name}</p>
                                </div>

                                {application.coverLetter && (
                                  <div>
                                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Cover Letter</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                      {application.coverLetter}
                                    </div>
                                  </div>
                                )}

                                {application.expectedSalary && (
                                  <div>
                                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Expected Salary</h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                      {application.expectedSalary.currency} {application.expectedSalary.amount.toLocaleString()} / {application.expectedSalary.period}
                                    </p>
                                  </div>
                                )}

                                {application.availability && (
                                  <div>
                                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Availability</h4>
                                    <p className="text-gray-700 dark:text-gray-300"><strong>Start Date:</strong> {formatDate(application.availability.startDate)}</p>
                                    <p className="text-gray-700 dark:text-gray-300"><strong>Notice Period:</strong> {application.availability.noticePeriod} days</p>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <Button
                                    onClick={() => handleUpdateStatus(application._id, 'shortlisted')}
                                    disabled={updatingStatus === application._id || application.status === 'shortlisted'}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Shortlist
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(application._id, 'rejected')}
                                    disabled={updatingStatus === application._id || application.status === 'rejected'}
                                    className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>


                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(application._id, 'shortlisted')}
                            disabled={updatingStatus === application._id || application.status === 'shortlisted'}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(application._id, 'rejected')}
                            disabled={updatingStatus === application._id || application.status === 'rejected'}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedStatus !== "all" || selectedJob !== "all" || searchQuery
                    ? "Try adjusting your filters to see more applications."
                    : "Applications will appear here once candidates start applying to your jobs."}
                </p>
                {selectedStatus === "all" && selectedJob === "all" && !searchQuery && (
                  <Link href="/recruiter/post-job">
                    <Button>Post a Job</Button>
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6">
                <Pagination pagination={pagination} onPageChange={fetchApplications} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  )
} 