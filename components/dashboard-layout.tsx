"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { io } from "socket.io-client";
import CITBIF from "../public/images/CITBIF_logo.png"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Home,
  UserCheck,
  GraduationCap,
  Building,
  MessageSquare,
  Download,
  Upload,
  Bell,
} from "lucide-react"

interface User {
  _id: string
  email: string
  role: string
  name: string
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  timestamp: string;
}


interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const socket = io("http://localhost:5000");


export default function DashboardLayout({ children, user, activeTab, onTabChange }: DashboardLayoutProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    socket.on(`notification:${user._id}`, (data) => {
      console.log("📩 New Notification:", data);
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      socket.off(`notification:${user._id}`);
    };
  }, [user?._id]);


  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const getNavigationItems = () => {
    switch (user.role) {
      case "superuser":
        return [
          { id: "dashboard", title: "Dashboard", icon: Home },
          { id: "departments", title: "Departments", icon: Building },
          { id: "curriculum", title: "Curriculum Review", icon: FileText },
        ]
      case "hod":
        return [
          { id: "dashboard", title: "Dashboard", icon: Home },
          { id: "subjects", title: "Subject Allocation", icon: BookOpen },
          { id: "curriculum", title: "Curriculum Creation", icon: FileText },
          { id: "tracker", title: "Syllabus Tracker", icon: Download },
        ]
      case "faculty":
        return [
          { id: "dashboard", title: "Dashboard", icon: Home },
          { id: "drafts", title: "Draft Syllabus", icon: UserCheck },
        ]
      case "subject-expert":
        return [
          { id: "dashboard", title: "Dashboard", icon: Home },
          { id: "review", title: "Syllabus Review", icon: UserCheck },
          { id: "create-draft", title: "Create Syllabus Draft", icon: FileText }
        ]
      default:
        return [{ id: "dashboard", title: "Dashboard", icon: Home }]
    }
  }

  const getRoleColor = () => {
    switch (user.role) {
      case "admin":
        return "bg-red-500"
      case "hod":
        return "bg-blue-500"
      case "faculty":
        return "bg-green-500"
      case "subject-expert":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/notifications/${user._id}`);
        const data = await res.json();
        console.log("USER ID:", user?._id);
        console.log("🔔 Fetched Notifications:", data); // ✅ Log and verify
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    if (user?._id) fetchNotifications();
  }, [user._id]);



  const navigationItems = getNavigationItems()

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };


  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Left Sidebar */}
      <div className="w-20 gradient-bg flex flex-col items-center py-6 space-y-6 fixed top-0 left-0 h-screen z-50">
        {/* App Icon */}
        <div className="w-15 h-15 rounded-xl flex items-center justify-center">
          <img src="/images/CITBIF_logo.png" alt="Logo" />
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              className={`w-12 h-12 rounded-xl transition-all duration-200 ${
                activeTab === item.id ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => onTabChange?.(item.id)}
              title={item.title}
            >
              <item.icon className="w-5 h-5" />
            </Button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-12 h-12 rounded-xl text-white/70 hover:text-white hover:bg-yellow-500/20"
          title="Toggle Theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>


        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl text-white/70 hover:text-white hover:bg-red-500/20"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-20">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground capitalize">
                {user.role.replace("-", " ").toUpperCase()} Portal
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}

                </Button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-md shadow-lg z-50">
                    <div className="p-3 border-b font-semibold text-sm dark:text-white">Notifications</div>
                    <ul className="max-h-60 overflow-y-auto text-sm">
                      {notifications.length === 0 ? (
                        <li className="p-3 text-gray-500 dark:text-gray-400">No notifications</li>
                      ) : (
                        [...notifications]
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((note) => (
                            <li
                              key={note._id}
                              className={`p-3 border-b dark:border-gray-700 cursor-pointer transition-colors ${
                                note.read
                                  ? "text-gray-500 dark:text-gray-400"
                                  : "text-foreground font-semibold bg-purple-50 dark:bg-purple-900/20"
                              }`}
                              onClick={async () => {
                                if (!note.read) {
                                  try {
                                    await fetch(`http://localhost:5000/api/auth/notifications/${note._id}/mark-read`, {
                                      method: "PUT"
                                    });
                                    setNotifications((prev) =>
                                      prev.map((n) => (n._id === note._id ? { ...n, read: true } : n))
                                    );
                                  } catch (error) {
                                    console.error("Failed to mark notification as read", error);
                                  }
                                }
                              }}
                            >
                              {note.message}
                              <div className="text-xs text-gray-400">
                                {new Date(note.timestamp).toLocaleString()}
                              </div>
                            </li>
                          ))
                      )}
                    </ul>
                  </div>
                )}
              </div>


              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <Badge className={`${getRoleColor()} text-white text-xs`}>
                    {user.role.toUpperCase().replace("-", " ")}
                  </Badge>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>


        {/* Content Area */}
        <main className="flex-1 p-6 custom-scrollbar overflow-auto">{children}</main>
      </div>
    </div>
  )
}
