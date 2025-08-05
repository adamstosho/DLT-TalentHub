"use client"

import React from "react"
import { Button } from "./button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Pagination as PaginationType } from "@/types/common"

interface PaginationProps {
  pagination: PaginationType
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange, className }) => {
  const { page, pages, hasNext, hasPrev } = pagination

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < pages - 1) {
      rangeWithDots.push("...", pages)
    } else if (pages > 1) {
      rangeWithDots.push(pages)
    }

    return rangeWithDots
  }

  if (pages <= 1) return null

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={!hasPrev}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center space-x-1">
        {getVisiblePages().map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === "..." ? (
              <Button variant="ghost" size="sm" disabled>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
              >
                {pageNum}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={!hasNext}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
