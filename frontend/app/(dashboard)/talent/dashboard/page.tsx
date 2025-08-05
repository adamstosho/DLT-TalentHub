"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import api from "@/lib/api"
import Link from "next/link"
import { User, Briefcase, Eye, FileText, TrendingUp, MapPin, AlertCircle } from "lucide-react"

interface TalentStats {
  profileViews: number
  applicationsSent: number
  responseRate: number
  averageSalary: number
}

interface Application {
  _id: string
  jobTitle: string
  company: string
  status: string
  appliedAt: string
}

export default function TalentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<TalentStats | null>(null)
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch talent profile and stats
        const [profileResponse, applicationsResponse] = await Promise.all([
          api.get("/talents/profile"),
          api.get("/talents/applications"),
        ])

        // Calculate profile completion
        const profile = profileResponse.data.data.talent
        let completion = 0
        if (profile?.skills?.length > 0) completion += 25
        if (profile?.experience?.length > 0) completion += 25
        if (profile?.education?.length > 0) completion += 25
        if (profile?.cv) completion += 25
        setProfileCompletion(completion)

        // Mock stats for now - replace with actual API data
        setStats({
          profileViews: profile?.profileViews || 0,
          applicationsSent: applicationsResponse.data.data.applications?.length || 0,
          responseRate: 75,
          averageSalary: 65000,
        })

        setRecentApplications(applicationsResponse.data.data.applications?.slice(0, 5) || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        // Set default values if API calls fail
        setStats({
          profileViews: 0,
          applicationsSent: 0,
          responseRate: 0,
          averageSalary: 0,
        })
        setRecentApplications([])
        setProfileCompletion(0)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Here's what's happening with your job search today.</p>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <Card className="mb-8 border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <div>
                    <h3 className="font-semibold">Complete your profile</h3>
                    <p className="text-sm text-gray-600">
                      Your profile is {profileCompletion}% complete. Complete it to get more visibility.
                    </p>
                  </div>
                </div>
                <Link href="/talent/profile">
                  <Button>Complete Profile</Button>
                </Link>
              </div>
              <Progress value={profileCompletion} className="mt-4" />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.profileViews || 0}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.applicationsSent || 0}</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.responseRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Salary Target</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.averageSalary?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">USD per year</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Track the status of your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{application.jobTitle}</h4>
                            <p className="text-sm text-gray-600">{application.company}</p>
                            <p className="text-xs text-gray-500">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-4">Start applying to jobs to see your applications here.</p>
                    <Link href="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/jobs" className="block">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/talent/profile" className="block">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </Button>
                </Link>
                <Link href="/talent/applications" className="block">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatar || "/user-avatar.svg"} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user?.location || "Location not set"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
