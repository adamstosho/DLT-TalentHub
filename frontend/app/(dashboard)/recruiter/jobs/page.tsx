"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import api from "@/lib/api"
import type { Job } from "@/types/job"
import type { Pagination as PaginationType } from "@/types/common"
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Users, Calendar, DollarSign, MapPin } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "paused", label: "Paused" },
    { value: "closed", label: "Closed" },
  ]

  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

      if (searchQuery) params.append("q", searchQuery)
      if (selectedStatus && selectedStatus !== "all") params.append("status", selectedStatus)

      const response = await api.get(`/recruiters/jobs?${params.toString()}`)
      setJobs(response.data.data.jobs)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, selectedStatus])

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await api.put(`/jobs/${jobId}`, { status: newStatus })
      toast.success("Job status updated successfully")
      fetchJobs()
    } catch (error) {
      toast.error("Failed to update job status")
    }
  }

  const handleDeleteJob = async () => {
    if (!deleteJobId) return

    try {
      await api.delete(`/jobs/${deleteJobId}`)
      toast.success("Job deleted successfully")
      setDeleteJobId(null)
      fetchJobs()
    } catch (error) {
      toast.error("Failed to delete job")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active"
      case "draft":
        return "status-draft"
      case "paused":
        return "status-paused"
      case "closed":
        return "status-closed"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">My Job Postings</h1>
            <p className="text-gray-600">Manage your job postings and track applications</p>
          </div>
          <Link href="/recruiter/post-job">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput placeholder="Search jobs..." onSearch={setSearchQuery} />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
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

        {/* Job Listings */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {jobs.map((job) => (
                <Card key={job._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-primary mb-2">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location?.type === "remote" ? "Remote" : 
                           job.location?.type === "hybrid" ? "Hybrid" :
                           job.location?.city && job.location?.country ? 
                           `${job.location.city}, ${job.location.country}` : 
                           "Location not specified"}
                        </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary?.currency && job.salary?.min && job.salary?.max 
                                  ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                                  : "Salary not specified"
                                }
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Unknown"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                            {job.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                            {job.isFeatured && <Badge className="bg-secondary text-primary">Featured</Badge>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.type && <Badge>{job.type.replace("-", " ")}</Badge>}
                          {job.category && <Badge variant="outline">{job.category}</Badge>}
                          {job.skills && job.skills.length > 0 && (
                            <>
                              {job.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{job.skills.length - 3} more
                                </Badge>
                              )}
                            </>
                          )}
                        </div>

                        <p className="text-gray-700 text-sm line-clamp-2 mb-4">{job.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {job.views || 0} views
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {job.applications?.total || 0} applications
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/jobs/${job._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/recruiter/jobs/${job._id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Job
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(job._id, job.status === "active" ? "paused" : "active")
                                  }
                                >
                                  {job.status === "active" ? "Pause Job" : "Activate Job"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(job._id, "closed")}
                                  disabled={job.status === "closed"}
                                >
                                  Close Job
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteJobId(job._id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pagination && pagination.pages > 1 && <Pagination pagination={pagination} onPageChange={fetchJobs} />}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-6">Create your first job posting to start finding great candidates</p>
              <Link href="/recruiter/post-job">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Job Posting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete this job posting? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDeleteJobId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteJob}>
                  Delete Job
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
