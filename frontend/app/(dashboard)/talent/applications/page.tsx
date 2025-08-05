"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import api from "@/lib/api"
import type { JobApplication } from "@/types/job"
import type { Pagination as PaginationType } from "@/types/common"
import { FileText, Calendar, DollarSign, Clock, Eye, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

export default function TalentApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)


  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interviewed", label: "Interviewed" },
    { value: "offered", label: "Offered" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ]

  const fetchApplications = async (page = 1, status = selectedStatus) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

      if (status && status !== "all") params.append("status", status)

      const response = await api.get(`/talents/applications?${params.toString()}`)
      setApplications(response.data.data.applications)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [selectedStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "reviewed":
        return "status-reviewed"
      case "shortlisted":
        return "status-shortlisted"
      case "interviewed":
        return "status-interviewed"
      case "offered":
        return "status-offered"
      case "accepted":
        return "status-accepted"
      case "rejected":
        return "status-rejected"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: 0,
      active: 0,
      completed: 0,
    }

    applications.forEach((app) => {
      if (app.status === "pending") counts.pending++
      else if (["reviewed", "shortlisted", "interviewed", "offered"].includes(app.status)) counts.active++
      else if (["accepted", "rejected"].includes(app.status)) counts.completed++
    })

    return counts
  }

  const filterApplicationsByTab = (tab: string) => {
    switch (tab) {
      case "pending":
        return applications.filter((app) => app.status === "pending")
      case "active":
        return applications.filter((app) => ["reviewed", "shortlisted", "interviewed", "offered"].includes(app.status))
      case "completed":
        return applications.filter((app) => ["accepted", "rejected"].includes(app.status))
      default:
        return applications
    }
  }

  const counts = getStatusCounts()
  const filteredApplications = filterApplicationsByTab(activeTab)

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application)
    setShowApplicationModal(true)
  }



  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-32"></div>
                  </div>
                ))}
              </div>
            ) : filteredApplications.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card key={application._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={application.job?.company?.logo?.url || "/company-logo.svg"}
                                alt={application.job?.company?.name || "Company"}
                              />
                              <AvatarFallback>{application.job?.company?.name?.[0] || "C"}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-primary mb-1">
                                    {application.job?.title || "Job Title"}
                                  </h3>
                                  <p className="text-gray-600 mb-2">
                                    {application.job?.company?.name || "Company Name"}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Applied {new Date(application.appliedAt).toLocaleDateString()}
                                </div>
                                {application.expectedSalary && (
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Expected: {application.expectedSalary.currency}{" "}
                                    {application.expectedSalary.amount.toLocaleString()}
                                  </div>
                                )}
                                {application.availability?.startDate && (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Available from {new Date(application.availability.startDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              {application.coverLetter && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-700 line-clamp-2">{application.coverLetter}</p>
                                </div>
                              )}

                              {application.notes && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm font-medium text-blue-900 mb-1">Recruiter Notes:</p>
                                  <p className="text-sm text-blue-800">{application.notes}</p>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                  Last updated: {new Date(application.updatedAt || application.appliedAt).toLocaleDateString()}
                                </div>
                                <div className="flex space-x-2">
                                  {application.job?._id || application.jobId ? (
                                    <Link href={`/jobs/${application.job?._id || application.jobId}`}>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Job
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button variant="outline" size="sm" disabled>
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Job
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewApplication(application)}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View Application
                                  </Button>
                                  
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {pagination && pagination.pages > 1 && (
                  <Pagination pagination={pagination} onPageChange={fetchApplications} className="mt-8" />
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === "all"
                      ? "You haven't applied to any jobs yet. Start browsing opportunities!"
                      : `No ${activeTab} applications found.`}
                  </p>
                  <Link href="/jobs">
                    <Button>
                      Browse Jobs
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Details Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white font-semibold">
              Application Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Complete application information for {selectedApplication?.job?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Job Information */}
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedApplication.job?.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {selectedApplication.job?.company?.name}
                </p>
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status}
                </Badge>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Application Date</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cover Letter</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  </div>
                )}

                {selectedApplication.expectedSalary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Expected Salary</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedApplication.expectedSalary.currency} {selectedApplication.expectedSalary.amount.toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedApplication.availability && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Availability</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Available from {new Date(selectedApplication.availability.startDate).toLocaleDateString()}
                      {selectedApplication.availability.hoursPerWeek && 
                        ` (${selectedApplication.availability.hoursPerWeek} hours/week)`
                      }
                    </p>
                  </div>
                )}

                {selectedApplication.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recruiter Notes</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-800 dark:text-blue-200">
                        {selectedApplication.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  )
}
