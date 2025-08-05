"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { JobCard } from "@/components/job/JobCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Search, Bookmark, Filter, Briefcase, MapPin, Calendar } from "lucide-react"
import toast from "react-hot-toast"

interface Job {
  _id: string
  title: string
  description: string
  company: {
    name: string
    logo?: string
  }
  type: string
  category: string
  location: {
    city?: string
    country?: string
    remote?: boolean
  }
  salary: {
    min?: number
    max?: number
    currency: string
  }
  status: string
  isUrgent: boolean
  isFeatured: boolean
  createdAt: string
  recruiter: {
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function SavedJobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
     const [searchQuery, setSearchQuery] = useState("")
   const [selectedType, setSelectedType] = useState("all")
   const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchSavedJobs = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

             if (searchQuery) params.append("q", searchQuery)
       if (selectedType && selectedType !== "all") params.append("type", selectedType)
       if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)

      const response = await api.get(`/jobs/saved?${params.toString()}`)
      setJobs(response.data.data.jobs)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error)
      toast.error("Failed to load saved jobs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSavedJobs()
    }
  }, [user, searchQuery, selectedType, selectedCategory])

  const handleSearch = () => {
    fetchSavedJobs(1)
  }

  const handlePageChange = (page: number) => {
    fetchSavedJobs(page)
  }

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await api.delete(`/jobs/${jobId}/save`)
      toast.success("Job removed from saved jobs")
      // Refresh the list
      fetchSavedJobs(pagination?.page || 1)
    } catch (error) {
      console.error("Failed to unsave job:", error)
      toast.error("Failed to remove job from saved jobs")
    }
  }

  const jobTypes = [
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
  ]

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
    "Other",
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in to view saved jobs</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Saved Jobs</h1>
          </div>
          <p className="text-muted-foreground">
            Your saved job opportunities. Click on any job to view details or apply.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="all">All Types</SelectItem>
                   {jobTypes.map((type) => (
                     <SelectItem key={type.value} value={type.value}>
                       {type.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="all">All Categories</SelectItem>
                   {categories.map((category) => (
                     <SelectItem key={category} value={category}>
                       {category}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading saved jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No saved jobs found</h3>
                             <p className="text-muted-foreground mb-4">
                 {searchQuery || selectedType !== "all" || selectedCategory !== "all"
                   ? "Try adjusting your search criteria"
                   : "Start saving jobs you're interested in to see them here"}
               </p>
               {searchQuery || selectedType !== "all" || selectedCategory !== "all" ? (
                <Button
                  variant="outline"
                                     onClick={() => {
                     setSearchQuery("")
                     setSelectedType("all")
                     setSelectedCategory("all")
                   }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button asChild>
                  <a href="/jobs">Browse Jobs</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {jobs.length} of {pagination?.total || 0} saved jobs
              </p>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  showSaveButton={false}
                  onUnsave={() => handleUnsaveJob(job._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 