"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import type { Job } from "@/types/job"
import { MapPin, DollarSign, Users, Eye, Bookmark, Share2, Building, Globe, Calendar, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  // Application form data
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    expectedSalary: "",
    availabilityDate: "",
    hoursPerWeek: "",
  })

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${params.id}`)
        console.log("Job data received:", response.data)
        setJob(response.data.data.job)

        // Check if job is saved (if user is logged in and is a talent)
        if (user && user.role === 'talent') {
          try {
            const savedResponse = await api.get("/jobs/saved")
            const savedJobIds = savedResponse.data.data.jobs.map((j: any) => j._id)
            setIsSaved(savedJobIds.includes(params.id))
          } catch (error) {
            console.log("Failed to check saved jobs:", error)
            // Ignore error for saved jobs check
          }
        }
      } catch (error) {
        console.error("Failed to fetch job:", error)
        router.push("/jobs")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJob()
    }
  }, [params.id, user, router])

  const handleSaveJob = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      if (isSaved) {
        await api.delete(`/jobs/${params.id}/save`)
        setIsSaved(false)
        toast.success("Job removed from saved jobs")
      } else {
        await api.post(`/jobs/${params.id}/save`)
        setIsSaved(true)
        toast.success("Job saved successfully")
      }
    } catch (error) {
      toast.error("Failed to save job")
    }
  }

  const handleApply = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "talent") {
      toast.error("Only talents can apply to jobs")
      return
    }

    setApplying(true)
    try {
      const payload = {
        coverLetter: applicationData.coverLetter,
        expectedSalary: applicationData.expectedSalary
          ? {
              amount: Number.parseInt(applicationData.expectedSalary),
              currency: "USD",
            }
          : undefined,
        availability: {
          startDate: applicationData.availabilityDate,
          hoursPerWeek: applicationData.hoursPerWeek ? Number.parseInt(applicationData.hoursPerWeek) : undefined,
        },
      }

      await api.post(`/jobs/${params.id}/apply`, payload)
      toast.success("Application submitted successfully!")
      setShowApplicationModal(false)
      setApplicationData({
        coverLetter: "",
        expectedSalary: "",
        availabilityDate: "",
        hoursPerWeek: "",
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application")
    } finally {
      setApplying(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job opportunity: ${job?.title} at ${job?.company?.name || "Company"}`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success("Job link copied to clipboard")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Job link copied to clipboard")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
            <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
          </div>
        </div>
      </div>
    )
  }

  // Additional safety check to ensure job has required fields
  if (!job.title || !job.description) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job data is incomplete</h1>
            <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
          </div>
        </div>
      </div>
    )
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={job.company?.logo?.url || "/company-logo.svg"} alt={job.company?.name || "Company"} />
                  <AvatarFallback>{job.company?.name?.[0] || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company?.name || "Company"}
                    </div>
                                            <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location?.type === "remote" ? "Remote" : 
                           job.location?.type === "hybrid" ? "Hybrid" :
                           job.location?.city && job.location?.country ? 
                           `${job.location.city}, ${job.location.country}` : 
                           "Location not specified"}
                        </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveJob} className={isSaved ? "text-secondary" : ""}>
                  <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {job.type && (
              <Badge
                className={`${job.type === "full-time" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
              >
                {job.type.replace("-", " ")}
              </Badge>
              )}
              {job.category && <Badge variant="outline">{job.category}</Badge>}
              {job.isUrgent && <Badge variant="destructive">Urgent</Badge>}
              {job.isFeatured && <Badge className="bg-secondary text-primary">Featured</Badge>}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-semibold">
                    {job.salary?.min && job.salary?.max && job.salary?.currency 
                      ? formatSalary(job.salary.min, job.salary.max, job.salary.currency)
                      : "Not specified"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Applications</p>
                  <p className="font-semibold">{job.applications?.total || 0} candidates</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Views</p>
                  <p className="font-semibold">{job.views || 0} views</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
                <DialogTrigger asChild>
                  <Button size="lg" className="flex-1">
                    Apply Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Apply for {job.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="coverLetter" className="text-gray-900 dark:text-white font-medium">Cover Letter</Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Tell us why you're perfect for this role..."
                        value={applicationData.coverLetter}
                        onChange={(e) => setApplicationData((prev) => ({ ...prev, coverLetter: e.target.value }))}
                        rows={6}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expectedSalary" className="text-gray-900 dark:text-white font-medium">Expected Salary (USD)</Label>
                        <Input
                          id="expectedSalary"
                          type="number"
                          placeholder="75000"
                          value={applicationData.expectedSalary}
                          onChange={(e) => setApplicationData((prev) => ({ ...prev, expectedSalary: e.target.value }))}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hoursPerWeek" className="text-gray-900 dark:text-white font-medium">Hours per Week</Label>
                        <Input
                          id="hoursPerWeek"
                          type="number"
                          placeholder="40"
                          value={applicationData.hoursPerWeek}
                          onChange={(e) => setApplicationData((prev) => ({ ...prev, hoursPerWeek: e.target.value }))}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availabilityDate" className="text-gray-900 dark:text-white font-medium">Available Start Date</Label>
                      <Input
                        id="availabilityDate"
                        type="date"
                        value={applicationData.availabilityDate}
                        onChange={(e) => setApplicationData((prev) => ({ ...prev, availabilityDate: e.target.value }))}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => setShowApplicationModal(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Cancel
                      </Button>
                      <Button onClick={handleApply} disabled={applying} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {applying ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="lg" onClick={handleSaveJob}>
                <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save Job"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
                ) : (
                  <p className="text-gray-500">No specific requirements listed.</p>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {job.skills && job.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                ) : (
                  <p className="text-gray-500">No specific skills listed.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.company?.name || "Company"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.company?.logo?.url || "/company-logo.svg"} alt={job.company?.name || "Company"} />
                    <AvatarFallback>{job.company?.name?.[0] || "C"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{job.company?.name || "Company"}</h3>
                    {job.company?.website && (
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline flex items-center text-sm"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-semibold">{job.applications?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{job.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-semibold">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={`status-${job.status || 'unknown'}`}>{job.status || 'Unknown'}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
