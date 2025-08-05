"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { Pagination as PaginationType } from "@/types/common"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { 
  Briefcase, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe
} from "lucide-react"
import toast from "react-hot-toast"

interface Job {
  _id: string
  title: string
  description: string
  company: {
    name: string
    logo?: {
      url: string
    }
    location?: string
    size?: string
    industry?: string
  }
  recruiter: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  category: string
  skills: string[]
  location: {
    type: 'remote' | 'hybrid' | 'onsite'
    city?: string
    country?: string
  }
  salary: {
    min?: number
    max?: number
    currency: string
    period: string
    isNegotiable: boolean
  }
  experience: {
    min?: number
    max?: number
  }
  status: 'active' | 'draft' | 'paused' | 'closed'
  applicationsCount?: number
  createdAt: string
  updatedAt: string
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [deletingJob, setDeletingJob] = useState<string | null>(null)

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "paused", label: "Paused" },
    { value: "closed", label: "Closed" }
  ]

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" }
  ]

  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      })

      if (searchQuery) params.append("q", searchQuery)
      if (selectedStatus !== "all") params.append("status", selectedStatus)
      if (selectedType !== "all") params.append("type", selectedType)

      const response = await api.get(`/admin/jobs?${params.toString()}`)
      setJobs(response.data.data.jobs)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
      toast.error("Failed to fetch jobs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, selectedStatus, selectedType])

  const handleStatusChange = async (jobId: string, status: string) => {
    setUpdatingStatus(jobId)
    try {
      await api.put(`/admin/jobs/${jobId}/status`, { status })
      toast.success("Job status updated successfully")
      fetchJobs()
    } catch (error) {
      console.error("Failed to update job status:", error)
      toast.error("Failed to update job status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDeleteJob = async () => {
    if (!selectedJob) return

    setDeletingJob(selectedJob._id)
    try {
      await api.delete(`/admin/jobs/${selectedJob._id}`)
      toast.success("Job deleted successfully")
      setShowDeleteDialog(false)
      setSelectedJob(null)
      fetchJobs()
    } catch (error) {
      console.error("Failed to delete job:", error)
      toast.error("Failed to delete job")
    } finally {
      setDeletingJob(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'part-time':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'contract':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'freelance':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      case 'internship':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSalary = (salary: Job['salary']) => {
    if (!salary.min && !salary.max) return 'Not specified'
    
    const currency = salary.currency || 'USD'
    const period = salary.period || 'monthly'
    
    if (salary.min && salary.max) {
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} / ${period}`
    } else if (salary.min) {
      return `${currency} ${salary.min.toLocaleString()}+ / ${period}`
    } else if (salary.max) {
      return `${currency} Up to ${salary.max.toLocaleString()} / ${period}`
    }
    
    return 'Not specified'
  }

  const exportJobs = () => {
    const csvContent = [
      ['Title', 'Company', 'Type', 'Status', 'Applications', 'Created Date'].join(','),
      ...jobs.map(job => [
        job.title,
        job.company.name,
        job.type,
        job.status,
        job.applicationsCount || 0,
        formatDate(job.createdAt)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobs-export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Jobs exported successfully")
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Jobs Management</h1>
          <p className="text-gray-600">Monitor and manage all jobs in the system</p>
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
                    placeholder="Search jobs..."
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
                <Label>Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                    setSelectedType("all")
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

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {pagination && `Showing ${pagination.page} of ${pagination.pages} pages`}
          </div>
          <Button onClick={exportJobs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Jobs
          </Button>
        </div>

        {/* Jobs List */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {job.company.logo?.url ? (
                              <img 
                                src={job.company.logo.url} 
                                alt={job.company.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {job.title}
                              </h3>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                              <Badge className={getTypeColor(job.type)}>
                                {job.type}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-1" />
                                {job.company.name}
                              </div>
                              {job.location.city && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {job.location.city}, {job.location.country}
                                </div>
                              )}
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {formatSalary(job.salary)}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {job.applicationsCount || 0} applications
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Posted {formatDate(job.createdAt)}
                              </div>
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-1" />
                                {job.location.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                            <DialogHeader>
                              <DialogTitle>{job.title}</DialogTitle>
                              <DialogDescription>
                                {job.company.name} • {job.location.type}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">Company</Label>
                                  <p className="text-sm text-gray-600">{job.company.name}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Recruiter</Label>
                                  <p className="text-sm text-gray-600">{job.recruiter.firstName} {job.recruiter.lastName}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Type</Label>
                                  <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                                </div>
                                <div>
                                  <Label className="font-semibold">Status</Label>
                                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                </div>
                                <div>
                                  <Label className="font-semibold">Salary</Label>
                                  <p className="text-sm text-gray-600">{formatSalary(job.salary)}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Applications</Label>
                                  <p className="text-sm text-gray-600">{job.applicationsCount || 0}</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="font-semibold">Description</Label>
                                <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                              </div>
                              
                              {job.skills.length > 0 && (
                                <div>
                                  <Label className="font-semibold">Skills</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {job.skills.map((skill, index) => (
                                      <Badge key={index} variant="secondary">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Select
                          value={job.status}
                          onValueChange={(value) => handleStatusChange(job._id, value)}
                          disabled={updatingStatus === job._id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Job</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={deletingJob === selectedJob?._id}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteJob}
                                disabled={deletingJob === selectedJob?._id}
                              >
                                {deletingJob === selectedJob?._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedStatus !== "all" || selectedType !== "all" || searchQuery
                    ? "Try adjusting your filters to see more jobs."
                    : "No jobs have been posted yet."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6">
                <Pagination pagination={pagination} onPageChange={fetchJobs} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 