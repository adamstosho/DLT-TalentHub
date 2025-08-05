"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useNotifications } from "@/context/NotificationContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Menu, X, User, Settings, LogOut, Users, Bookmark, Briefcase, FileText, Search } from "lucide-react"
import { useRouter } from "next/navigation"

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "talent":
        return "/talent/dashboard"
      case "recruiter":
        return "/recruiter/dashboard"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/dashboard"
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="DLT TalentHub" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Jobs - visible to all authenticated users */}
            {/* Recruiter-specific navigation */}
            {user?.role === "recruiter" && (
              <>
                <Link href="/talents" className="text-gray-700 hover:text-primary transition-colors">
                  Find Talent
                </Link>
                <Link href="/recruiter/post-job" className="text-gray-700 hover:text-primary transition-colors">
                  Post Job
                </Link>
                <Link href="/recruiter/jobs" className="text-gray-700 hover:text-primary transition-colors">
                  My Jobs
                </Link>
                <Link href="/recruiter/applications" className="text-gray-700 hover:text-primary transition-colors">
                  Applications
                </Link>
              </>
            )}

            {/* Talent-specific navigation */}
            {user?.role === "talent" && (
              <>
                <Link href="/jobs" className="text-gray-700 hover:text-primary transition-colors">
                  Jobs
                </Link>
                <Link href="/talents" className="text-gray-700 hover:text-primary transition-colors">
                  Browse Talents
                </Link>
                <Link href="/talent/applications" className="text-gray-700 hover:text-primary transition-colors">
                  My Applications
                </Link>
              </>
            )}

            {/* Admin-specific navigation */}
            {user?.role === "admin" && (
              <>
                <Link href="/admin/users" className="text-gray-700 hover:text-primary transition-colors">
                  Users
                </Link>
                <Link href="/admin/jobs" className="text-gray-700 hover:text-primary transition-colors">
                  Manage Jobs
                </Link>

              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {/* Notification items would go here */}
                      <DropdownMenuItem>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">New job application</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/user-avatar.svg"} alt={user.firstName} />
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-200" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={(user?.role === "talent" ? "/talent/profile" : user?.role === "recruiter" ? "/recruiter/profile" : "/admin/profile") as any}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {/* Talent-specific menu items */}
                    {user?.role === "talent" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/saved-jobs">
                            <Bookmark className="mr-2 h-4 w-4" />
                            <span>Saved Jobs</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={"/talent/applications" as any}>
                            <User className="mr-2 h-4 w-4" />
                            <span>My Applications</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Recruiter-specific menu items */}
                    {user?.role === "recruiter" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={"/recruiter/jobs" as any}>
                            <User className="mr-2 h-4 w-4" />
                            <span>My Jobs</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={"/recruiter/applications" as any}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Applications</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Admin-specific menu items */}
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users">
                            <Users className="mr-2 h-4 w-4" />
                            <span>User Management</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={"/admin/jobs" as any}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Job Management</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {/* Jobs - visible to all authenticated users */}
              <Link
                href="/jobs"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Jobs
              </Link>

              {/* Recruiter-specific mobile navigation */}
              {user?.role === "recruiter" && (
                <>
                  <Link
                    href="/talents"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Find Talent
                  </Link>
                  <Link
                    href="/recruiter/post-job"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Post Job
                  </Link>
                  <Link
                    href={"/recruiter/jobs" as any}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Jobs
                  </Link>
                  <Link
                    href={"/recruiter/applications" as any}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Applications
                  </Link>
                </>
              )}

              {/* Talent-specific mobile navigation */}
              {user?.role === "talent" && (
                <>
                  <Link
                    href="/talents"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Talents
                  </Link>
                  <Link
                    href={"/talent/applications" as any}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                  <Link
                    href="/saved-jobs"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Saved Jobs
                  </Link>
                </>
              )}

              {/* Admin-specific mobile navigation */}
              {user?.role === "admin" && (
                <>
                  <Link
                    href="/admin/users"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/jobs"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Manage Jobs
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
