"use client"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, BookOpen, FileText, Download, Eye, TrendingUp, Edit, Filter } from "lucide-react"
import DashboardLayout from "./dashboard-layout"
import CreateCurriculum from "./curriculum/create-curriculum"

interface User {
  _id: string
  email: string
  role: string
  name: string
}

interface Subject {
  _id: string;
  code: string;
  title: string;
  assignedFaculty: string;
  assignedExpert: string;
  syllabusUrl: string;
  status: string;
  lastUpdated: string;
}



interface HODDashboardProps {
  user: User
}

export default function HODDashboard({ user }: HODDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false)
  const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false)
  const [isExpertDialogOpen, setIsExpertDialogOpen] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [newSubjectCode, setNewSubjectCode] = useState("")
  const [newSubjectName, setNewSubjectName] = useState("")
  const [facultyName, setFacultyName] = useState("")
  const [expertName, setExpertName] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("subject")
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false)
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [expertForm, setexpertForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [facultyList, setFacultyList] = useState<{ _id: string; name: string; email: string }[]>([])
  const [expertList, setExpertList] = useState<{ _id: string; name: string; email: string }[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);



  useEffect(() => {
    const fetchDropdownUsers = async () => {
      const [facultyRes, expertRes] = await Promise.all([
        fetch("http://localhost:5000/api/auth/by-role?role=faculty"),
        fetch("http://localhost:5000/api/auth/by-role?role=subject-expert"),
      ]);

      const facultyNames = await facultyRes.json();
      const expertNames = await expertRes.json();

      setFacultyList(facultyNames);
      setExpertList(expertNames);
    };

    fetchDropdownUsers();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, []);
  
  const fetchSubjects = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/get-subjects?createdBy=${user._id}`);
      const data = await res.json();
      setSubjects(data);
      console.log("📦 Subjects fetched:", data);
    } catch (error) {
      console.error("❌ Error fetching subjects:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Draft":
        return "bg-yellow-100 text-yellow-800"
      case "Sent to HOD":
        return "bg-purple-100 text-purple-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-purple-100 text-purple-800"
    }
  }

  const handleAddSubject = async () => {
  if (newSubjectCode && newSubjectName) {
    try {
      const res = await fetch("http://localhost:5000/api/auth/add-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newSubjectCode,
          title: newSubjectName,
          assignedFaculty: "",
          assignedExpert: "",
          createdBy: user._id
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error adding subject");

      // Refetch subjects after adding
      const refetch = await fetch(`http://localhost:5000/api/auth/get-subjects?createdBy=${user._id}`);

      const updatedSubjects = await refetch.json();
      setSubjects(updatedSubjects);

      setNewSubjectCode("");
      setNewSubjectName("");
      setIsAddSubjectOpen(false);
    } catch (err) {
      console.error("Add subject failed:", err);
    }
  }
};



  const handleAssignFaculty = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setIsFacultyDialogOpen(true)
  }

  const handleAssignExpert = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setIsExpertDialogOpen(true)
  }

  const handleSaveFaculty = async () => {
    if (!selectedSubjectId || !selectedFaculty) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-fac-exp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          assignedFaculty: selectedFaculty
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign faculty");

      console.log("✅ Faculty assigned:", data);
      fetchSubjects(); // re-fetch subjects from DB
    } catch (err) {
      console.error("Error assigning faculty:", err);
    }

    setIsFacultyDialogOpen(false);
  };

  const handleSaveExpert = async () => {
    if (!selectedSubjectId || !selectedExpert) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-fac-exp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          assignedExpert: selectedExpert,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign expert");

      console.log("✅ Expert assigned:", data);
      fetchSubjects(); // re-fetch subjects from DB
    } catch (err) {
      console.error("Error assigning expert:", err);
    }

    setIsExpertDialogOpen(false);
  };


  const handleEditSubject = (subject: any) => {
    setSelectedSubjectId(subject._id)
    setNewSubjectCode(subject.code)
    setNewSubjectName(subject.title)
    setFacultyName(subject.assignedFaculty)
    setExpertName(subject.assignedExpert)
    setIsEditSubjectOpen(true)
    setSelectedFaculty(subject.assignedFaculty);
    setSelectedExpert(subject.assignedExpert);
  }

  const handleUpdateSubject = async () => {
  if (!selectedSubjectId) return;

  try {
    const res = await fetch(`http://localhost:5000/api/auth/edit-subjects/${selectedSubjectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: newSubjectCode,
        title: newSubjectName,
        assignedFaculty: selectedFaculty,
        assignedExpert: selectedExpert,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to update subject");
    }

    const updated = await res.json();

    // Update local state
    setSubjects((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );

    setIsEditSubjectOpen(false);
    setSelectedSubjectId(null);
    setNewSubjectCode("");
    setNewSubjectName("");
    setSelectedFaculty(null);
    setSelectedExpert(null);
  } catch (err) {
    console.error("Update failed:", err);
    alert("Error updating subject");
  }
};



    const assignFaculty = async () => {
      setCreating(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        const res = await fetch("http://localhost:5000/api/auth/assign-faculty", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(facultyForm),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create faculty");

        alert("Faculty created successfully");
        setFacultyForm({
          name: "",
          email: "",
          password: "",
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
          alert(err.message);
        } else {
          console.error("An unexpected error occurred", err);
        }
      } finally {
        setCreating(false);
      }
    };

    const getFacultyNameById = (id: string | undefined): string | null => {
      const found = facultyList.find((f) => f._id === id);
      return found ? found.name : null;
    };

    const handleApprove = async (subjectId: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/subject/${subjectId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to approve subject");

    const { subject } = await res.json();

    // Update the local state with the new subject data
    setSubjects((prevSubjects) =>
      prevSubjects.map((subj) =>
        subj._id === subjectId ? { ...subj, status: "Approved", lastUpdated: subject.lastUpdated } : subj
      )
    );

    alert("Subject approved successfully");
  } catch (err) {
    console.error("Error approving subject:", err);
    alert("Error approving subject");
  }
};


const handleReject = async (subjectId: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/subject/${subjectId}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to reject subject");

    const { subject } = await res.json();

    // Update the local state with the new subject data
    setSubjects((prevSubjects) =>
      prevSubjects.map((subj) =>
        subj._id === subjectId ? { ...subj, status: "Rejected", lastUpdated: subject.lastUpdated } : subj
      )
    );

    alert("Subject rejected successfully");
  } catch (err) {
    console.error("Error rejecting subject:", err);
    alert("Error rejecting subject");
  }
};



    const getExpertNameById = (id: string | undefined): string | null => {
      const found = expertList.find((e) => e._id === id);
      return found ? found.name : null;
    };      

    const totalSubjects = subjects.length;
    const completedSubjects = subjects.filter((s) => s.status === "Sent to HOD").length;

    const completionRate = totalSubjects > 0 
      ? Math.round((completedSubjects / totalSubjects) * 100) 
      : 0;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subjects.length}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Syllabi</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subjects.filter((item) => item.status !== "Sent to HOD").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting submission</p>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <p className="text-xs text-muted-foreground">Overall progress</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Recent Syllabus Activity</CardTitle>
                <CardDescription>Latest updates from faculty members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item._id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.title} syllabus
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {getFacultyNameById(item.assignedFaculty)} •{" "}
                            {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : "Not updated"}
                          </p>
                        </div>
                        <Badge className={getStatusColor(item.status === "Sent to HOD" ? "Received" : item.status)}>{item.status === "Sent to HOD" ? "Received" : item.status}</Badge>
                      </div>
                  ))}

                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "subjects":
        return (
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subject Allocation
                  </CardTitle>
                  <CardDescription>Manage subjects and assign faculty members and experts</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsAddSubjectOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Faculty
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Faculty</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={facultyForm.name}
                            onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                            placeholder="Enter name"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={facultyForm.email}
                            onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                            placeholder="Enter email"
                          />
                        </div>
                        <div>
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={facultyForm.password}
                            onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={creating}
                          onClick={assignFaculty}
                        >
                          {creating ? "Assigning..." : "Assign Faculty"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expert
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Expert</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={expertForm.name}
                            onChange={(e) => setexpertForm({ ...expertForm, name: e.target.value })}
                            placeholder="Enter expert name"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={expertForm.email}
                            onChange={(e) => setexpertForm({ ...expertForm, email: e.target.value })}
                            placeholder="Enter expert email"
                          />
                        </div>
                        <div>
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={expertForm.password}
                            onChange={(e) => setexpertForm({ ...expertForm, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={creating}
                          onClick={async () => {
                            setCreating(true);
                            try {
                              const res = await fetch("http://localhost:5000/api/auth/assign-expert", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  name: expertForm.name,
                                  email: expertForm.email,
                                  password: expertForm.password,
                                  role: "subject-expert",
                                }),
                              });

                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error || "Failed to create expert");

                              alert("Expert added successfully");

                              setexpertForm({
                                name: "",
                                email: "",
                                password: "",
                              });
                            } catch (err: any) {
                              console.error("Error creating expert:", err.message);
                              alert("Failed to create expert");
                            } finally {
                              setCreating(false);
                            }
                          }}
                        >
                          {creating ? "Creating..." : "Add Expert"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                </div>

              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Title</TableHead>
                    <TableHead>Assigned Faculty</TableHead>
                    <TableHead>Assigned Expert</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject._id} className="hover:bg-muted">
                      <TableCell className="font-medium">{subject.code}</TableCell>
                      <TableCell>{subject.title}</TableCell>
                      <TableCell>
                        {subject.assignedFaculty ? (
                          <span className="text-sm font-medium text-black-700">
                            {getFacultyNameById(subject.assignedFaculty)}
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignFaculty(subject._id)}
                          >
                            Assign Faculty
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {subject.assignedExpert ? (
                          <span className="text-sm font-medium text-black-700">
                            {getExpertNameById(subject.assignedExpert)}
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignExpert(subject._id)}
                          >
                            Assign Expert
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEditSubject(subject)}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            {/* Add Subject Dialog */}
            <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject-code">Subject Code</Label>
                    <Input
                      id="subject-code"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                      placeholder="Enter subject code (e.g., CS101)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject-title">Subject Title</Label>
                    <Input
                      id="subject-title"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="Enter subject Title"
                    />
                  </div>
                  <Button onClick={handleAddSubject} className="w-full bg-purple-600 hover:bg-purple-700">
                    Add Subject
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Subject Dialog */}
            <Dialog open={isEditSubjectOpen} onOpenChange={setIsEditSubjectOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Subject</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-subject-code">Subject Code</Label>
                    <Input
                      id="edit-subject-code"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                      placeholder="Enter subject code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-subject-name">Subject Name</Label>
                    <Input
                      id="edit-subject-name"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="Enter subject name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-faculty">Assigned Faculty</Label>
                    <Select value={selectedFaculty ?? ""} onValueChange={(val) => setSelectedFaculty(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a faculty member" />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyList.map((f) => (
                          <SelectItem key={f._id} value={f._id}>
                            {f.name} ({f.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-expert">Assigned Expert</Label>
                    <Select value={selectedExpert ?? ""} onValueChange={(val) => setSelectedExpert(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a subject expert" />
                      </SelectTrigger>
                      <SelectContent>
                        {expertList.map((e) => (
                          <SelectItem key={e._id} value={e._id}>
                            {e.name} ({e.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleUpdateSubject} className="w-full bg-purple-600 hover:bg-purple-700">
                    Update Subject
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Assign Faculty Dialog */}
            <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Faculty</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Faculty</Label>
                    
                    <Select value={selectedFaculty ?? ""} onValueChange={(val) => setSelectedFaculty(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a faculty member" />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyList.map((f) => (
                          <SelectItem key={f._id} value={f._id}>
                            {f.name} ({f.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveFaculty} className="w-full bg-purple-600 hover:bg-purple-700">
                    Assign Faculty
                  </Button>
                </div>
              </DialogContent>
            </Dialog>


            {/* Assign Expert Dialog */}
            <Dialog open={isExpertDialogOpen} onOpenChange={setIsExpertDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Subject Expert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Expert</Label>
                    <Select value={selectedExpert ?? ""} onValueChange={(val) => setSelectedExpert(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a subject expert" />
                      </SelectTrigger>
                      <SelectContent>
                        {expertList.map((e) => (
                          <SelectItem key={e._id} value={e._id}>
                            {e.name} ({e.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveExpert} className="w-full bg-purple-600 hover:bg-purple-700">
                    Assign Expert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </Card>
        )

      case "tracker":
        return (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Syllabus Tracker
              </CardTitle>
              <CardDescription>Track the status of syllabi created by you</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Syllabus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject._id} className="hover:bg-muted">
                      <TableCell className="font-medium">{subject.title}</TableCell>
                      <TableCell>{getFacultyNameById(subject.assignedFaculty) || "N/A"}</TableCell>
                    <TableCell>
                        <Badge className={getStatusColor(subject.status === "Sent to HOD" ? "Received" : subject.status)}>
                          {subject.status === "Sent to HOD" ? "Received" : subject.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {subject.lastUpdated && subject.status === "Sent to HOD"
                          ? new Date(subject.lastUpdated).toLocaleString()
                          : "Not Updated"}
                      </TableCell>
                     <TableCell className="flex flex-wrap gap-2">
                        {subject.syllabusUrl && (
                          <a
                            href={`http://localhost:5000/api/auth/file/${subject.syllabusUrl}`}
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

                        {subject.status === "Sent to HOD" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to approve this syllabus?")) {
                                  handleApprove(subject._id);
                                }
                              }}
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to reject this syllabus?")) {
                                  handleReject(subject._id);
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                      </TableCell>



                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );



      case "curriculum":
        return <CreateCurriculum />

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

