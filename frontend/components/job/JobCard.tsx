"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, DollarSign, Users, Eye, Bookmark } from "lucide-react"
import type { Job } from "@/types/job"
import { cn } from "@/lib/utils"

interface JobCardProps {
  job: Job
  onSave?: (jobId: string) => void
  onUnsave?: (jobId: string) => void
  isSaved?: boolean
  showSaveButton?: boolean
  showCompanyLogo?: boolean
  className?: string
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSave,
  onUnsave,
  isSaved = false,
  showSaveButton = true,
  showCompanyLogo = true,
  className,
}) => {
  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "bg-green-100 text-green-800"
      case "part-time":
        return "bg-blue-100 text-blue-800"
      case "contract":
        return "bg-purple-100 text-purple-800"
      case "freelance":
        return "bg-orange-100 text-orange-800"
      case "internship":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow cursor-pointer", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {showCompanyLogo && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={job.company?.logo?.url || "/company-logo.svg"} alt={job.company?.name || "Company"} />
                <AvatarFallback>{job.company?.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <Link href={`/jobs/${job._id}`}>
                <h3 className="font-semibold text-lg hover:text-secondary transition-colors">{job.title}</h3>
              </Link>
              <p className="text-gray-600">{job.company?.name || "Company"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {job.isUrgent && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
            {job.isFeatured && <Badge className="bg-secondary text-primary text-xs">Featured</Badge>}
            {showSaveButton && (onSave || onUnsave) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  if (isSaved && onUnsave) {
                    onUnsave(job._id)
                  } else if (!isSaved && onSave) {
                    onSave(job._id)
                  }
                }}
                className={cn(isSaved && "text-secondary")}
              >
                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {job.type && (
            <Badge className={getJobTypeColor(job.type)}>{job.type.replace("-", " ")}</Badge>
          )}
          {job.category && <Badge variant="outline">{job.category}</Badge>}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
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
              {job.salary?.min && job.salary?.max && job.salary?.currency 
                ? formatSalary(job.salary.min, job.salary.max, job.salary.currency)
                : "Salary not specified"
              }
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {job.views || 0} views
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {job.applications?.total || 0} applications
            </div>
          </div>

          <Link href={`/jobs/${job._id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
