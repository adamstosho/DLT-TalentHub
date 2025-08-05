"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { Pagination as PaginationType } from "@/types/common"

import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  AlertTriangle
} from "lucide-react"
import toast from "react-hot-toast"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'talent' | 'recruiter' | 'admin'
  isActive: boolean
  createdAt: string
  lastLogin?: string
  avatar?: string
  bio?: string
  location?: string
}



export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "talent", label: "Talent" },
    { value: "recruiter", label: "Recruiter" },
    { value: "admin", label: "Admin" }
  ]

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ]

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      })

      if (searchQuery) params.append("q", searchQuery)
      if (selectedRole !== "all") params.append("role", selectedRole)
      if (selectedStatus !== "all") params.append("status", selectedStatus)

      const response = await api.get(`/admin/users?${params.toString()}`)
      setUsers(response.data.data.users)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, selectedRole, selectedStatus])

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    setUpdatingStatus(userId)
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive })
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isActive } : user
      ))
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast.error("Failed to update user status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setDeletingUser(selectedUser._id)
    try {
      await api.delete(`/admin/users/${selectedUser._id}`)
      setUsers(prev => prev.filter(user => user._id !== selectedUser._id))
      toast.success("User deleted successfully")
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    } finally {
      setDeletingUser(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "recruiter":
        return "bg-blue-100 text-blue-800"
      case "talent":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "recruiter":
        return <Users className="h-4 w-4" />
      case "talent":
        return <UserCheck className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportUsers = () => {
    // Simple CSV export
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Created Date'],
      ...users.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        formatDate(user.createdAt)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Users exported successfully")
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">User Management</h1>
            <p className="text-gray-600">Manage platform users and their permissions</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedRole("all")
                    setSelectedStatus("all")
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({pagination?.total || 0})</CardTitle>
            <CardDescription>
              Showing {users.length} of {pagination?.total || 0} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge className={getRoleColor(user.role)}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1">{user.role}</span>
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Joined {formatDate(user.createdAt)}
                            </span>
                            {user.location && (
                              <span>{user.location}</span>
                            )}
                          </div>
                        </div>
                      </div>

                                             <div className="flex items-center gap-2">
                         <Button
                           variant={user.isActive ? "default" : "secondary"}
                           size="sm"
                           onClick={() => handleStatusChange(user._id, !user.isActive)}
                           disabled={updatingStatus === user._id}
                         >
                           {updatingStatus === user._id ? "Updating..." : (user.isActive ? "Active" : "Inactive")}
                         </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-gray-900 dark:text-white font-semibold">User Details</DialogTitle>
                              <DialogDescription className="text-gray-600 dark:text-gray-300">
                                Detailed information about {user.firstName} {user.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>
                                    {user.firstName[0]}{user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {user.firstName} {user.lastName}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                                  <Badge className={getRoleColor(user.role)}>
                                    {user.role}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                                  <Badge variant={user.isActive ? "default" : "secondary"}>
                                    {user.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Joined:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(user.createdAt)}</span>
                                </div>
                                {user.location && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                                    <span className="text-sm text-gray-900 dark:text-white">{user.location}</span>
                                  </div>
                                )}
                                {user.bio && (
                                  <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Bio:</span>
                                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">{user.bio}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteDialog(true)
                          }}
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedRole !== "all" || selectedStatus !== "all"
                    ? "Try adjusting your filters to see more users."
                    : "No users have been registered yet."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6">
                <Pagination pagination={pagination} onPageChange={fetchUsers} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center text-gray-900 dark:text-white font-semibold">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Delete User
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? 
                This action cannot be undone and will permanently remove the user and all their data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deletingUser === selectedUser?._id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deletingUser === selectedUser?._id}
              >
                {deletingUser === selectedUser?._id ? "Deleting..." : "Delete User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 