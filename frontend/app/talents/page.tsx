"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"
import type { Talent } from "@/types/talent"
import type { Pagination as PaginationType } from "@/types/common"
import { MapPin, Briefcase, Mail, Filter, Download, Eye, ExternalLink, Send, Users, Star, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function TalentsPage() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [availableTalents, setAvailableTalents] = useState<Talent[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedAvailability, setSelectedAvailability] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const availabilityOptions = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
    { value: "unavailable", label: "Unavailable" },
  ]

  const locations = ["Lagos", "Abuja", "Cape Town", "Nairobi", "Cairo", "Accra", "Remote"]
  // Fetch all talents
  const fetchTalents = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      })

      if (searchQuery) params.append("q", searchQuery)
      if (selectedSkills.length > 0) params.append("skills", selectedSkills.join(","))
      if (selectedLocation && selectedLocation !== "all") params.append("location", selectedLocation)
      if (selectedAvailability && selectedAvailability !== "all") params.append("availability", selectedAvailability)

      console.log("Fetching talents with params:", params.toString())
      const response = await api.get(`/talents/search?${params.toString()}`)
      console.log("Talents response:", response.data)
      setTalents(response.data.data.talents)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch talents:", error)
      toast.error("Failed to load talents")
    } finally {
      setLoading(false)
    }
  }

  // Fetch available talents
  const fetchAvailableTalents = async () => {
    try {
      const response = await api.get("/talents/available")
      setAvailableTalents(response.data.data.talents)
    } catch (error) {
      console.error("Failed to fetch available talents:", error)
    }
  }

  // Fetch talents by skill
  const fetchTalentsBySkill = async (skillName: string) => {
    setLoading(true)
    try {
      const response = await api.get(`/talents/skills/${encodeURIComponent(skillName)}`)
      setTalents(response.data.data.talents)
      setPagination(response.data.data.pagination)
      toast.success(`Showing talents with ${skillName} skills`)
    } catch (error) {
      console.error("Failed to fetch talents by skill:", error)
      toast.error("Failed to load talents for this skill")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTalents()
    fetchAvailableTalents()
  }, [])

  useEffect(() => {
    if (activeTab === "all") {
      fetchTalents()
    }
  }, [searchQuery, selectedSkills, selectedLocation, selectedAvailability])

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleSkillClick = (skill: string) => {
    setActiveTab("all")
    setSelectedSkills([skill])
    fetchTalentsBySkill(skill)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedSkills([])
    setSelectedLocation("")
    setSelectedAvailability("")
  }

  const exportTalents = () => {
    // Implementation for exporting talents data
    console.log("Exporting talents...")
    toast.success("Export feature coming soon!")
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-yellow-100 text-yellow-800"
      case "unavailable":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      setShowContactModal(false)
      setContactMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const openContactModal = (talent: Talent) => {
    setSelectedTalent(talent)
    setShowContactModal(true)
  }

  const renderTalentSection = (title: string, talents: Talent[], icon: React.ReactNode, emptyMessage: string) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {talents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((talent) => (
            <Card key={talent._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={talent.user.avatar} alt={talent.user.firstName} />
                    <AvatarFallback>
                      {talent.user.firstName?.[0]}
                      {talent.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {talent.user.firstName} {talent.user.lastName}
                        </h3>
                        <p className="text-gray-600 mb-2">{talent.user.bio ? talent.user.bio.slice(0, 50) + "..." : "Professional"}</p>
                      </div>
                      <Badge className={getAvailabilityColor(talent.availability?.status || "available")}>
                        {talent.availability?.status || "Available"}
                      </Badge>
                    </div>

                    {talent.user.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {talent.user.location}
                      </div>
                    )}

                    {talent.skills && talent.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {talent.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill.name} variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                          {talent.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{talent.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {talent.experience ? `${talent.experience} years exp.` : "Experience not specified"}
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/talents/${talent._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => openContactModal(talent)}>
                          <Mail className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold text-primary mb-2">Find DLT Talent</h1>
          <p className="text-gray-600">Connect with skilled professionals in distributed ledger technology</p>
        </div>

        {/* Popular Skills */}
       

        {/* Available Talents Section */}
        {availableTalents.length > 0 && (
          renderTalentSection(
            "Available Now",
            availableTalents,
            <Clock className="h-5 w-5 text-green-500" />,
            "No available talents at the moment"
          )
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search talents by name, skills, or location..."
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
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Skills */}
                  

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Availability</label>
                    <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Talent Listings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="all">All Talents</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {pagination ? `Showing ${talents.length} of ${pagination.total} talents` : "Loading..."}
                </p>
                <Button variant="outline" onClick={exportTalents}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Talent Listings */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48"></div>
                  </div>
                ))}
              </div>
            ) : talents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {talents.map((talent) => (
                    <Card key={talent._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={talent.user.avatar} alt={talent.user.firstName} />
                            <AvatarFallback>
                              {talent.user.firstName?.[0]}
                              {talent.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {talent.user.firstName} {talent.user.lastName}
                                </h3>
                                <p className="text-gray-600 mb-2">{talent.user.bio ? talent.user.bio.slice(0, 50) + "..." : "Professional"}</p>
                              </div>
                              <Badge className={getAvailabilityColor(talent.availability?.status || "available")}>
                                {talent.availability?.status || "Available"}
                              </Badge>
                            </div>

                            {talent.user.location && (
                              <div className="flex items-center text-sm text-gray-500 mb-3">
                                <MapPin className="h-4 w-4 mr-1" />
                                {talent.user.location}
                              </div>
                            )}

                            {talent.skills && talent.skills.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-1">
                                  {talent.skills.slice(0, 3).map((skill) => (
                                    <Badge key={skill.name} variant="secondary" className="text-xs">
                                      {skill.name}
                                    </Badge>
                                  ))}
                                  {talent.skills.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{talent.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {talent.experience ? `${talent.experience} years exp.` : "Experience not specified"}
                              </div>
                              <div className="flex space-x-2">
                                <Link href={`/talents/${talent._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={() => openContactModal(talent)}>
                                  <Mail className="h-4 w-4 mr-1" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {pagination && <Pagination pagination={pagination} onPageChange={fetchTalents} className="mt-8" />}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No talents found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {selectedTalent?.user.firstName} {selectedTalent?.user.lastName}</DialogTitle>
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
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleContactTalent} disabled={sendingMessage}>
                <Send className="h-4 w-4 mr-2" />
                {sendingMessage ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
