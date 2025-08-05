"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/context/NotificationContext"
import { Bell, Check, CheckCheck, Trash2, Settings } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: any
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications()
  const [selectedTab, setSelectedTab] = useState("all")

  useEffect(() => {
    fetchNotifications()
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_application":
        return "💼"
      case "application_status":
        return "📋"
      case "job_match":
        return "🎯"
      case "message":
        return "💬"
      case "system":
        return "⚙️"
      default:
        return "🔔"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "job_application":
        return "bg-blue-100 text-blue-800"
      case "application_status":
        return "bg-green-100 text-green-800"
      case "job_match":
        return "bg-purple-100 text-purple-800"
      case "message":
        return "bg-orange-100 text-orange-800"
      case "system":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filterNotifications = (tab: string) => {
    switch (tab) {
      case "unread":
        return notifications.filter((n) => !n.isRead)
      case "read":
        return notifications.filter((n) => n.isRead)
      default:
        return notifications
    }
  }

  const filteredNotifications = filterNotifications(selectedTab)

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your latest activities</p>
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.isRead ? "border-l-4 border-l-secondary bg-blue-50/30" : ""
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3
                                className={`font-semibold ${!notification.isRead ? "text-primary" : "text-gray-900"}`}
                              >
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={getNotificationColor(notification.type)} variant="secondary">
                                  {notification.type.replace("_", " ")}
                                </Badge>
                                {!notification.isRead && <div className="w-2 h-2 bg-secondary rounded-full"></div>}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              <div className="flex space-x-2">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markAsRead(notification._id)
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
                <CardContent className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedTab === "unread" ? "No unread notifications" : "No notifications"}
                  </h3>
                  <p className="text-gray-600">
                    {selectedTab === "unread"
                      ? "You're all caught up! Check back later for new updates."
                      : "You don't have any notifications yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
