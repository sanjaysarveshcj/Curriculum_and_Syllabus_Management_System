"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FileText, CheckCircle, MessageSquare, Download, Upload } from "lucide-react"
import DashboardLayout from "./dashboard-layout"
import CreateSyllabus from "./syllabus/create-syllabus"


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

  useEffect(() => {
    fetchAssignedSubjects()
  }, [user._id])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Draft":
        return "bg-yellow-200 text-yellow-700"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Sent to HOD":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSendToHOD = async (subjectId: string, file: File) => {
  try {
    // Upload the file first
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("http://localhost:5000/api/auth/upload", {
      method: "POST",
      body: formData,
    });

    const { fileId } = await uploadRes.json();
    console.log("Uploaded file ID:", fileId);


    if (!fileId) throw new Error("File upload failed");

    // Link file to subject and update status
    const res = await fetch("http://localhost:5000/api/auth/send-to-hod", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, fileId }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to send");

    // Refresh drafts or notify user
    fetchAssignedSubjects(); // <- Your function to refresh the data
  } catch (error) {
    console.error("Send to HOD failed:", error);
    alert("Failed to send to HOD: " + error);
  }
};


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
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
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
                  <TableCell onClick={() => setActiveTab("create-draft")}>{review.title}</TableCell>
                  <TableCell>{review.facultyName}</TableCell>
                  <TableCell>{review.lastUpdated ? new Date(review.lastUpdated).toLocaleString() : "—"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                          <input
                            type="file"
                            id={`upload-hod-${review._id}`}
                            accept=".docx,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setReviews((prev) =>
                                prev.map((d) =>
                                  d._id === review._id ? { ...d, draftFile: file } : d
                                )
                              );
                              // Automatically upload file to HOD after selection
                              handleSendToHOD(review._id, file);
                            }}
                          />

                          {review.status !== "Approved" && (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() =>
                                document.getElementById(`upload-hod-${review._id}`)?.click()
                              }
                            >
                              <Upload className="mr-1 h-3 w-3" />
                              Send to HOD
                            </Button>
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

      case "create-draft":
        return <CreateSyllabus />

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