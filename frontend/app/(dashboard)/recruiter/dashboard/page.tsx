"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import Link from "next/link"
import { Briefcase, Users, Eye, Plus, Clock, CheckCircle, UserCheck, TrendingUp, DollarSign, Target, Search, Mail, Star } from "lucide-react"
import toast from "react-hot-toast"

interface RecruiterStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  hiredTalents?: number
  totalViews?: number
  conversionRate?: number
  averageResponseTime?: number
}

interface Job {
  _id: string
  title: string
  status: string
  applications: {
    total: number
    shortlisted: number
    rejected: number
  }
  views: number
  createdAt: string
}

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
}

interface Talent {
  _id: string
  user: {
    firstName: string
    lastName: string
    email: string
    avatar?: string
    location?: string
  }
  skills: Array<{
    name: string
    level: string
  }>
  experience: Array<{
    title: string
    company: string
  }>
  availability: {
    status: string
  }
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<RecruiterStats | null>(null)
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTalentSearch, setShowTalentSearch] = useState(false)
  const [talentSearchQuery, setTalentSearchQuery] = useState("")
  const [selectedJobForSearch, setSelectedJobForSearch] = useState("")
  const [contactMessage, setContactMessage] = useState("")
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/recruiters/dashboard")
        const data = response.data.data
        
        setStats(data.stats)
        setRecentJobs(data.jobs || [])
        setRecentApplications(data.applications || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

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

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status: newStatus })
      
      // Update local state
      setRecentApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )
      
      toast.success("Application status updated successfully")
    } catch (error) {
      console.error("Failed to update application status:", error)
      toast.error("Failed to update application status")
    }
  }

  const handleContactTalent = async () => {
    if (!selectedTalent || !contactMessage.trim()) {
      toast.error("Please enter a message")
      return
    }

    setSendingMessage(true)
    try {
      // This would be implemented when messaging API is available
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Message sent successfully!")
      setShowTalentSearch(false)
      setContactMessage("")
      setSelectedTalent(null)
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const openContactModal = (talent: Talent) => {
    setSelectedTalent(talent)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-primary mb-2">Recruiter Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Enhanced Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeJobs} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingApplications} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hired Talents</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hiredTalents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.conversionRate ? `${stats.conversionRate}% conversion` : "Success rate"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.averageResponseTime ? `${stats.averageResponseTime}h avg response` : "Job visibility"}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-gray-600">Failed to load statistics</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/recruiter/post-job">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            </Link>
            

            <Link href="/recruiter/applications">
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Applications
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Jobs
              </CardTitle>
              <CardDescription>Your latest job postings and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.slice(0, 5).map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{job.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{job.applications.total} applications</span>
                          <span>{job.views} views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                                                 <Link href={"/recruiter/jobs/" + job._id as any}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No jobs posted yet</p>
                  <Link href="/recruiter/post-job">
                    <Button className="mt-2">Post Your First Job</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Applications
              </CardTitle>
              <CardDescription>Latest applications that need your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.slice(0, 5).map((application) => (
                    <div key={application._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
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
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getApplicationStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                                                 <Link href={"/recruiter/applications/" + application._id as any}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
        </div>

        {/* Contact Talent Modal */}
        <Dialog>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Contact {selectedTalent?.user.firstName} {selectedTalent?.user.lastName}
              </DialogTitle>
              <DialogDescription>
                Send a message to connect with this talent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Hi, I'm interested in connecting with you..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedTalent(null)}>
                  Cancel
                </Button>
                <Button onClick={handleContactTalent} disabled={sendingMessage}>
                  <Mail className="h-4 w-4 mr-2" />
                  {sendingMessage ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
