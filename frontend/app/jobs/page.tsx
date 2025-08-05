"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { JobCard } from "@/components/job/JobCard"
import { SearchInput } from "@/components/ui/search-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Briefcase, Star, Clock, TrendingUp, MapPin, Building } from "lucide-react"
import api from "@/lib/api"
import type { Job } from "@/types/job"
import type { Pagination as PaginationType } from "@/types/common"
import toast from "react-hot-toast"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [urgentJobs, setUrgentJobs] = useState<Job[]>([])
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all-types")
  const [selectedCategory, setSelectedCategory] = useState<string>("all-categories")
  const [selectedLocation, setSelectedLocation] = useState<string>("all-locations")
  const [salaryRange, setSalaryRange] = useState([0, 200000])
  const [isRemote, setIsRemote] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const jobTypes = ["full-time", "part-time", "contract", "freelance", "internship"]
  const categories = [
    "Software Development", 
    "Data Science", 
    "Design", 
    "Marketing", 
    "Sales", 
    "Customer Support",
    "Product Management",
    "DevOps",
    "QA/Testing",
    "Other"
  ]
  const locations = ["Lagos", "Abuja", "Cape Town", "Nairobi", "Cairo", "Accra", "Remote"]

  // Fetch all jobs (basic listing)
  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      })

      if (searchQuery) params.append("q", searchQuery)
      if (selectedType !== "all-types") params.append("type", selectedType)
      if (selectedCategory !== "all-categories") params.append("category", selectedCategory)
      if (selectedLocation !== "all-locations") params.append("location", selectedLocation)
      if (isRemote) params.append("remote", "true")
      if (isUrgent) params.append("urgent", "true")
      if (isFeatured) params.append("featured", "true")

      const response = await api.get(`/jobs/search?${params.toString()}`)
      setJobs(response.data.data.jobs)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
      toast.error("Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  // Fetch urgent jobs
  const fetchUrgentJobs = async () => {
    try {
      const response = await api.get("/jobs/urgent")
      setUrgentJobs(response.data.data.jobs)
    } catch (error) {
      console.error("Failed to fetch urgent jobs:", error)
    }
  }

  // Fetch featured jobs
  const fetchFeaturedJobs = async () => {
    try {
      const response = await api.get("/jobs/featured")
      setFeaturedJobs(response.data.data.jobs)
    } catch (error) {
      console.error("Failed to fetch featured jobs:", error)
    }
  }

  // Fetch jobs by category
  const fetchJobsByCategory = async (category: string) => {
    setLoading(true)
    try {
      const response = await api.get(`/jobs/category/${encodeURIComponent(category)}`)
      setJobs(response.data.data.jobs)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch jobs by category:", error)
      toast.error("Failed to load jobs for this category")
    } finally {
      setLoading(false)
    }
  }

  // Fetch saved jobs for current user
  const fetchSavedJobs = async () => {
    try {
      const response = await api.get("/jobs/saved")
      const savedJobIds = response.data.data.jobs.map((job: Job) => job._id)
      setSavedJobs(savedJobIds)
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error)
    }
  }

  useEffect(() => {
    fetchJobs()
    fetchUrgentJobs()
    fetchFeaturedJobs()
    fetchSavedJobs()
  }, [])

  useEffect(() => {
    if (activeTab === "all") {
      fetchJobs()
    }
  }, [searchQuery, selectedType, selectedCategory, selectedLocation, isRemote, isUrgent, isFeatured])

  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobs.includes(jobId)) {
        // Unsave job
        await api.delete(`/jobs/${jobId}/save`)
        setSavedJobs((prev) => prev.filter((id) => id !== jobId))
        toast.success("Job removed from saved jobs")
      } else {
        // Save job
        await api.post(`/jobs/${jobId}/save`)
        setSavedJobs((prev) => [...prev, jobId])
        toast.success("Job saved successfully")
      }
    } catch (error) {
      console.error("Failed to save/unsave job:", error)
      toast.error("Failed to save job")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("all-types")
    setSelectedCategory("all-categories")
    setSelectedLocation("all-locations")
    setSalaryRange([0, 200000])
    setIsRemote(false)
    setIsUrgent(false)
    setIsFeatured(false)
  }

  const handleCategoryClick = (category: string) => {
    setActiveTab("all")
    setSelectedCategory(category)
    fetchJobsByCategory(category)
  }

  const renderJobSection = (title: string, jobs: Job[], icon: React.ReactNode, emptyMessage: string) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job} 
              onSave={handleSaveJob} 
              onUnsave={handleSaveJob}
              isSaved={savedJobs.includes(job._id)} 
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{emptyMessage}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Find Your Dream DLT Job</h1>
          <p className="text-gray-600">Discover amazing opportunities in distributed ledger technology</p>
        </div>

        {/* Quick Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Popular Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => handleCategoryClick(category)}
                className="hover:bg-primary hover:text-white"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Urgent Jobs Section */}
        {urgentJobs.length > 0 && (
          renderJobSection(
            "Urgent Positions",
            urgentJobs,
            <Clock className="h-5 w-5 text-red-500" />,
            "No urgent positions available at the moment"
          )
        )}

        {/* Featured Jobs Section */}
        {featuredJobs.length > 0 && (
          renderJobSection(
            "Featured Opportunities",
            featuredJobs,
            <Star className="h-5 w-5 text-yellow-500" />,
            "No featured positions available at the moment"
          )
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search jobs, companies, or skills..."
                onSearch={setSearchQuery}
                className="w-full"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Job Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Job Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">All Types</SelectItem>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-locations">All Locations</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Salary Range: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
                    </label>
                    <Slider
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      max={200000}
                      min={0}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remote" checked={isRemote} onCheckedChange={(checked) => setIsRemote(checked === true)} />
                    <label htmlFor="remote" className="text-sm">
                      Remote Only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="urgent" checked={isUrgent} onCheckedChange={(checked) => setIsUrgent(checked === true)} />
                    <label htmlFor="urgent" className="text-sm">
                      Urgent Jobs
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(checked === true)} />
                    <label htmlFor="featured" className="text-sm">
                      Featured Jobs
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Job Listings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {pagination ? `Showing ${jobs.length} of ${pagination.total} jobs` : "Loading..."}
                </p>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job Listings */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {jobs.map((job) => (
                    <JobCard 
                      key={job._id} 
                      job={job} 
                      onSave={handleSaveJob} 
                      onUnsave={handleSaveJob}
                      isSaved={savedJobs.includes(job._id)} 
                    />
                  ))}
                </div>

                {pagination && <Pagination pagination={pagination} onPageChange={fetchJobs} className="mt-8" />}
              </>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
