"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FileText, CheckCircle, MessageSquare, Download } from "lucide-react"
import DashboardLayout from "./dashboard-layout"

interface User {
  _id: string
  email: string
  role: string
  name: string
}

interface SubjectItem {
  _id: string
  title: string
  assignedFaculty: string
  facultyName: string
  lastUpdated?: string
  status: string
  syllabusFile?: string
}

interface SubjectExpertDashboardProps {
  user: User
}

export default function SubjectExpertDashboard({ user }: SubjectExpertDashboardProps) {
  const [activeTab, setActiveTab] = useState("review")
  const [feedback, setFeedback] = useState("")
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<SubjectItem[]>([])

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/expert-subjects/${user._id}`)
        const data = await res.json()
        const formattedSubjects = data.map((item: any, idx: number) => ({
          _id: item._id,
          title: item.title,
          assignedFaculty: item.assignedFaculty,
          facultyName: item.facultyName,
          lastUpdated: item.lastUpdated,
          status: item.status,
          syllabusFile: item.syllabusUrl, // 👈 rename to match interface
        }));

        setReviews(formattedSubjects)
        console.log(formattedSubjects)
      } catch (err) {
        console.error("Failed to load subjects", err)
      }
    }
    fetchAssignedSubjects()
  }, [user._id])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-200 text-gray-700"
      case "Sent to Expert":
        return "bg-blue-100 text-blue-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Sent to HOD":
        return "bg-green-100 text-green-800"
      case "Sent Feedback":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApprove = async (subjectId: string) => {
    try {
      await fetch(`http://localhost:5000/api/auth/subject/${subjectId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
      setReviews((prev) =>
        prev.map((s) => s._id === subjectId ? { ...s, status: "Approved", lastUpdated: new Date().toISOString() } : s)
      )
    } catch (err) {
      console.error("Approve error:", err)
    }
  }

  const handleSendFeedback = async () => {
    if (!feedback.trim() || !selectedSyllabusId) return
    try {
      await fetch(`http://localhost:5000/api/auth/subject/${selectedSyllabusId}/feedback`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback })
      })
      setReviews((prev) =>
        prev.map((s) => s._id === selectedSyllabusId
          ? { ...s, status: "Rejected", lastUpdated: new Date().toISOString() }
          : s)
      )
      setFeedback("")
      setSelectedSyllabusId(null)
    } catch (err) {
      console.error("Feedback error:", err)
    }
  }

  const getExpertStatusLabel = (status: string) => {
    if (status === "Sent to Expert") return "Received";
    if (status === "Rejected") return "Sent Feedback";
    if (status == "Sent to HOD") return "Approved";
    return status;
  };

const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Assigned Subjects</CardTitle>
                  <CardDescription>Subjects you're reviewing</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{reviews.length}</CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Received Syllabi</CardTitle>
                  <CardDescription>Ready for review</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {reviews.filter((s) => s.status === "Sent to Expert").length}
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Approved</CardTitle>
                  <CardDescription>Successfully validated syllabi</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {reviews.filter((s) => s.status === "Sent to HOD" || s.status === "Approved").length}
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Feedback Sent</CardTitle>
                  <CardDescription>Syllabi with feedback sent to faculty</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {reviews.filter((s) => s.status === "Rejected").length}
                </CardContent>
              </Card>
            </div>

            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Syllabi Activity
                </CardTitle>
                <CardDescription>Latest syllabus submissions and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews
                  .filter((s) => !!s.lastUpdated)
                  .sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime())
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title} syllabus</p>
                        <p className="text-xs text-muted-foreground">
                          by {item.facultyName} • {new Date(item.lastUpdated!).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>{getExpertStatusLabel(item.status)}</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </>
        )


      case "review":
        return (
          <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Assigned Subjects
          </CardTitle>
          <CardDescription>Review and respond to submitted syllabus files</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.title}</TableCell>
                  <TableCell>{review.facultyName}</TableCell>
                  <TableCell>{review.lastUpdated ? new Date(review.lastUpdated).toLocaleString() : "—"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(review.status)}>{getExpertStatusLabel(review.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {review.syllabusFile && (
                        <a
                          href={`http://localhost:5000/api/auth/file/${review.syllabusFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </a>
                      )}

                      {review.status !== "Approved" && (
                        <>
                          <Button
                            onClick={() => handleApprove(review._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setSelectedSyllabusId(review._id)}>
                                <MessageSquare className="w-4 h-4 mr-1" /> Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Feedback - {review.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Write your feedback..."
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  className="min-h-32"
                                />
                                <Button
                                  onClick={handleSendFeedback}
                                  className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                  <MessageSquare className="mr-1 h-4 w-4" />
                                  Send Feedback
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        )

      default:
        return <div>Content for {activeTab}</div>
    }
  }

  return (
    <DashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  )
}