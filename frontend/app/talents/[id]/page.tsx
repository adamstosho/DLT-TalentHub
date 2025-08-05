"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import type { Talent } from "@/types/talent"
import { 
  MapPin, 
  Mail, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  ExternalLink,
  Eye,
  Download,
  Star,
  Clock,
  DollarSign,
  Send
} from "lucide-react"

export default function TalentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [talent, setTalent] = useState<Talent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const talentId = params.id as string

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/talents/${talentId}`)
        setTalent(response.data.data.talent)
      } catch (error: any) {
        console.error("Failed to fetch talent:", error)
        if (error.response?.status === 404) {
          setError("Talent profile not found")
        } else if (error.response?.status === 403) {
          setError("This talent profile is private")
        } else {
          setError("Failed to load talent profile")
        }
      } finally {
        setLoading(false)
      }
    }

    if (talentId) {
      fetchTalent()
    }
  }, [talentId])

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-purple-100 text-purple-800"
      case "advanced":
        return "bg-blue-100 text-blue-800"
      case "intermediate":
        return "bg-green-100 text-green-800"
      case "beginner":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  const calculateDuration = (startDate: string | Date, endDate?: string | Date, isCurrent?: boolean) => {
    const start = new Date(startDate)
    const end = isCurrent ? new Date() : endDate ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''}${diffMonths > 0 ? ` ${diffMonths} month${diffMonths > 1 ? 's' : ''}` : ''}`
    }
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
  }

  const handleContactTalent = async () => {
    if (!talent || !contactMessage.trim()) {
      return
    }

    setSendingMessage(true)
    try {
      // For now, we'll simulate sending a message
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      console.log(`Message sent to ${talent.user?.firstName} ${talent.user?.lastName}`)
      setShowContactModal(false)
      setContactMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="text-center">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/talents')}>
              Browse All Talents
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!talent) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={talent.user?.avatar || "/user-avatar.svg"}
                  alt={`${talent.user?.firstName} ${talent.user?.lastName}`}
                />
                <AvatarFallback className="text-3xl">
                  {talent.user?.firstName?.[0]}
                  {talent.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {talent.user?.firstName} {talent.user?.lastName}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  {talent.user?.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {talent.user.location}
                    </div>
                  )}
                  
                  <Badge className={getAvailabilityColor(talent.availability?.status || 'available')}>
                    {talent.availability?.status || 'available'}
                  </Badge>

                  {talent.views && (
                    <div className="flex items-center text-gray-600">
                      <Eye className="h-4 w-4 mr-1" />
                      {talent.views} views
                    </div>
                  )}
                </div>

                {talent.user?.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">
                    {talent.user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button onClick={() => setShowContactModal(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  {talent.cv && (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download CV
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {talent.skills && talent.skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talent.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{skill.name}</h4>
                          <p className="text-sm text-gray-600">
                            {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
                          </p>
                        </div>
                        <Badge className={getSkillLevelColor(skill.level)}>
                          {skill.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No skills listed</p>
                )}
              </CardContent>
            </Card>

            {/* Salary Expectations */}
            {talent.salary && talent.salary.minAmount && talent.salary.minAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Salary Expectations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">
                      {talent.salary.currency || 'USD'} {talent.salary.minAmount.toLocaleString()} - {talent.salary.maxAmount?.toLocaleString() || 'Negotiable'}
                    </span>
                    <span className="text-gray-600">per {talent.salary.period}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge className={getAvailabilityColor(talent.availability?.status || 'available')}>
                      {talent.availability?.status || 'available'}
                    </Badge>
                  </div>
                  {talent.availability?.noticePeriod && (
                    <div className="flex items-center justify-between">
                      <span>Notice Period:</span>
                      <span>{talent.availability.noticePeriod} days</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {talent.experience && talent.experience.length > 0 ? (
                  <div className="space-y-6">
                    {talent.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">{exp.title}</h4>
                          <Badge variant="outline">
                            {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1">{exp.company}</p>
                        {exp.location && (
                          <p className="text-gray-500 mb-2 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {exp.location}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No experience listed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                {talent.education && talent.education.length > 0 ? (
                  <div className="space-y-6">
                    {talent.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">{edu.degree}</h4>
                          <Badge variant="outline">
                            {calculateDuration(edu.startDate, edu.endDate, edu.isCurrent)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1">{edu.institution}</p>
                        <p className="text-gray-500 mb-2">{edu.fieldOfStudy}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : edu.endDate ? formatDate(edu.endDate) : 'Present'}
                        </p>
                        {edu.grade && (
                          <p className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No education listed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Portfolio & Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                {talent.portfolio ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talent.portfolio.github && (
                      <a 
                        href={talent.portfolio.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="h-5 w-5 mr-2" />
                        <span>GitHub</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    )}
                    {talent.portfolio.linkedin && (
                      <a 
                        href={talent.portfolio.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="h-5 w-5 mr-2" />
                        <span>LinkedIn</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    )}
                    {talent.portfolio.website && (
                      <a 
                        href={talent.portfolio.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="h-5 w-5 mr-2" />
                        <span>Website</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    )}
                    {talent.portfolio.otherLinks && talent.portfolio.otherLinks.length > 0 && (
                      talent.portfolio.otherLinks.map((link, index) => (
                        <a 
                          key={index}
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Globe className="h-5 w-5 mr-2" />
                          <span>{link.title}</span>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No portfolio links available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white font-semibold">
              Contact {talent?.user?.firstName} {talent?.user?.lastName}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Send a message to connect with this talent
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message" className="text-gray-900 dark:text-white">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Hi! I'm interested in connecting with you regarding potential opportunities..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowContactModal(false)
                  setContactMessage("")
                }}
                disabled={sendingMessage}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContactTalent}
                disabled={sendingMessage || !contactMessage.trim()}
              >
                {sendingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
} 