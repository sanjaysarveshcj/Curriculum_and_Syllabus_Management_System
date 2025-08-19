"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Building, Users, TrendingUp, Download } from "lucide-react"
import DashboardLayout from "./dashboard-layout"
import { toast } from "sonner"

interface User {
  _id: string
  email: string
  role: string
  name: string
}

interface AdminDashboardProps {
  user: User
}

interface DepartmentItem {
  department: string;
  hod: string;
  curriculumUrl?: string;
  lastUpdated?: string;
  version?: number;
  _id?: string;
}

interface DeptRow {
  _id: string
  name: string
  hodName: string
}

interface CurriculumRowProps {
  deptVersions: DepartmentItem[];
}

export const CurriculumRow = ({ deptVersions }: CurriculumRowProps) => {
  const department = deptVersions[0].department
  const hod = deptVersions[0].hod
  const [selectedVersion, setSelectedVersion] = useState<DepartmentItem | null>(() => {
    return (
      deptVersions
        .slice()
        .sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0] || null
    );
  });

  return (
    <tr className="border-t hover:bg-muted/50">
      <td className="p-2">{department}</td>
      <td className="p-2">{hod}</td>
      <td className="p-2">
        <Badge
          className={
            deptVersions.some((v) => v.curriculumUrl)
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {deptVersions.some((v) => v.curriculumUrl) ? "Submitted" : "Pending"}
        </Badge>
      </td>
      <td className="p-2">
        {deptVersions
          .map((v) => v.lastUpdated)
          .filter(Boolean)
          .sort()
          .reverse()[0]
          ? new Date(
              deptVersions
                .map((v) => v.lastUpdated)
                .filter(Boolean)
                .sort()
                .reverse()[0]!
            ).toLocaleString()
          : "—"}
      </td>
      <td className="p-2 flex items-center gap-2">
        <Select
          value={String(selectedVersion?.version ?? "")}
          onValueChange={(val) => {
            const version = deptVersions.find((v) => String(v.version ?? 0) === val);
            setSelectedVersion(version || null);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            {deptVersions
              .sort((a, b) => (b.version ?? 0) - (a.version ?? 0))
              .map((v, idx) => (
                <SelectItem key={v._id || idx} value={String(v.version ?? 0)}>
                  Version {v.version ?? "N/A"}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {selectedVersion ? (
          selectedVersion.curriculumUrl ? (
            <a
              href={`http://localhost:5000/api/auth/file/${selectedVersion.curriculumUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Button
                variant="outline"
                size="sm"
                className="text-purple-700 border-purple-500 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">No file</span>
          )
        ) : null}
      </td>
    </tr>
  )
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard")

  const [hodForm, setHodForm] = useState({ name: "", email: "", password: "", department: "" }); // department holds departmentId from dropdown
  const [creating, setCreating] = useState(false);

  const [allHods, setAllHods] = useState<User[]>([]);
  const [departments, setDepartments] = useState<DeptRow[]>([]);

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newDeptName, setNewDeptName] = useState("")
  const [selectedHodId, setSelectedHodId] = useState<string>("")

  const [regulations, setRegulations] = useState<Record<string, DepartmentItem>>({});
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const [newRegulationCode, setNewRegulationCode] = useState("");

  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptHOD, setEditDeptHOD] = useState("");
  const [showEditDialogId, setShowEditDialogId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  const fetchDepartments = async () => {
    const [hodRes, deptRes] = await Promise.all([
      fetch("http://localhost:5000/api/auth/hods"),
      fetch("http://localhost:5000/api/auth/departments"),
    ]);
    const hodData = await hodRes.json();
    const deptData = await deptRes.json();
    setAllHods(hodData);
    setDepartments(deptData);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:5000/api/auth/regulations");
      const data = await res.json();
      setRegulations(data);
    })();
  }, []);

  const handleUpdateDepartment = async (deptId: string) => {
    setShowEditDialogId(null);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/departments/${deptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editDeptName, hod: editDeptHOD }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Department updated");
      fetchDepartments();
    } catch (err) {
      console.error("Update error", err);
      toast.error("Failed to update department");
    }
  };

  const handleCreateRegulation = async () => {
    if (!newRegulationCode.trim()) return toast.error("Regulation code is required");
    try {
      const res = await fetch("http://localhost:5000/api/auth/create-regulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newRegulationCode }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(`❌ ${data.error}`);
      toast.success("✅ Regulation created");
      setNewRegulationCode("");
      const refreshed = await fetch("http://localhost:5000/api/auth/regulations");
      setRegulations(await refreshed.json());
    } catch (err) {
      console.error("Error creating regulation:", err);
      toast.error("❌ Failed to create regulation");
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return toast.error("Department name is required");
    try {
      const res = await fetch("http://localhost:5000/api/auth/create-department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName.trim(), hodId: selectedHodId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(`❌ ${data.error}`);
      toast.success(`✅ Department '${data.department.name}' created`);
      setShowCreateDialog(false);
      setNewDeptName("");
      setSelectedHodId("");
      fetchDepartments();
    } catch (err) {
      console.error("Error creating department:", err);
      toast.error("❌ Failed to create department");
    }
  };

  const assignHOD = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");
      if (!hodForm.department) throw new Error("Please select a department");

      // Map selected departmentId -> department name for user profile
      const dept = departments.find((d) => d._id === hodForm.department);
      const deptName = dept?.name ?? "";

      // 1) Create or upgrade HOD user
      const createRes = await fetch("http://localhost:5000/api/auth/assign-hod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: hodForm.name,
          email: hodForm.email,
          password: hodForm.password,
          department: deptName, // keep user-friendly name
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create HOD");
      const newHodId: string = createData.user?._id;
      if (!newHodId) throw new Error("No HOD id returned");

      // 2) Assign/replace HOD for department
      const deptRes = await fetch("http://localhost:5000/api/auth/change-hod", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ departmentId: hodForm.department, newHodId }),
      });
      if (!deptRes.ok) throw new Error("Failed to assign/replace HOD in department");

      toast.success("HOD assigned and department updated");
      setHodForm({ name: "", email: "", password: "", department: "" });
      fetchDepartments(); // refresh list immediately
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to assign HOD");
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Under Review":
        return "bg-blue-100 text-blue-800"
      case "Active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": {
        const allEntries = Object.values(regulations).flat();
        const recentActivities = allEntries
          .filter((item) => item.lastUpdated)
          .sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime())
          .slice(0, 3);
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{departments.length}</div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total HODs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allHods.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    {(() => {
                      const latestRegulationCode = Object.keys(regulations).sort().reverse()[0];
                      return (
                        <p className="text-xs text-muted-foreground">
                          Regulation <span className="font-semibold">{latestRegulationCode}</span>
                        </p>
                      );
                    })()}
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const latestRegulationCode = Object.keys(regulations).sort().reverse()[0];
                    const latestRegulationItems = (latestRegulationCode ? regulations[latestRegulationCode] : []) as DepartmentItem[];
                    const total = latestRegulationItems.length;
                    const completed = latestRegulationItems.filter((r: DepartmentItem) => !!r.curriculumUrl).length;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return <div className="text-2xl font-bold">{percentage}%</div>;
                  })()}
                </CardContent>
              </Card>
            </div>

            <Card className="hover-lift bg-card text-foreground transition-colors">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest curriculum updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-4 p-3 rounded-lg bg-muted text-foreground">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.department} curriculum {item.curriculumUrl ? "Submitted" : "Pending"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {item.hod} • {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : "—"}
                          </p>
                        </div>
                        <Badge className={getStatusColor(item.curriculumUrl ? "Submitted" : "Pending")}>
                          {item.curriculumUrl ? "Submitted" : "Pending"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      case "departments": {
        return (
          <Card className="animate-slide-up">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Building className="h-5 w-5 text-purple-700" />
                  Department Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage departments and assign HODs
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 text-white hover:bg-purple-700">+ Create Department</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Department</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
                      <select className="w-full px-3 py-2 border rounded-md dark:bg-background" value={selectedHodId} onChange={(e) => setSelectedHodId(e.target.value)}>
                        <option value="">Assign HOD (Optional)</option>
                        {allHods.map((hod) => (
                          <option key={hod._id} value={hod._id}>{hod.name} ({hod.email})</option>
                        ))}
                      </select>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleCreateDepartment}>Create Department</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create HOD
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New HOD</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Label>Name</Label>
                      <Input value={hodForm.name} onChange={(e) => setHodForm({ ...hodForm, name: e.target.value })} />
                      <Label>Email</Label>
                      <Input value={hodForm.email} onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })} />
                      <Label>Password</Label>
                      <Input type="password" value={hodForm.password} onChange={(e) => setHodForm({ ...hodForm, password: e.target.value })} />
                      <Label>Department</Label>
                      <Select value={hodForm.department} onValueChange={(val) => setHodForm({ ...hodForm, department: val })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={creating} onClick={assignHOD}>
                        {creating ? "Assigning..." : "Assign HOD"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Current HOD</TableHead>
                    <TableHead>Change HOD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept._id} className="hover:bg-muted transition-colors">
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.hodName}</TableCell>
                      <TableCell>
                        <Dialog open={showEditDialogId === dept._id} onOpenChange={(open) => { if (!open) setShowEditDialogId(null); }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-purple-600 border-purple-600"
                              onClick={() => { setEditDeptName(dept.name); setEditDeptHOD(""); setShowEditDialogId(dept._id); }}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Department</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input value={editDeptName} onChange={(e) => setEditDeptName(e.target.value)} placeholder="Department Name" />
                              <Select value={editDeptHOD} onValueChange={setEditDeptHOD}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select HOD" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allHods.map((hod) => (
                                    <SelectItem key={hod._id} value={hod._id}>{hod.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={() => handleUpdateDepartment(dept._id)} className="bg-purple-600 text-white w-full">Save Changes</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      }

      case "curriculum": {
        return (
          <>
            {!selectedRegulation ? (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-semibold text-purple-700">Regulations</h2>
                <p className="text-muted-foreground mb-4">Click a regulation to review department-wise curriculum submissions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.keys(regulations).map((regCode) => (
                    <Card key={regCode} className="cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-purple-500/40 bg-card text-foreground transition-all" onClick={() => setSelectedRegulation(regCode)}>
                      <CardHeader>
                        <CardTitle className="text-lg text-purple-700">Regulation {regCode}</CardTitle>
                        <CardDescription className="text-muted-foreground">View department-wise curriculum submissions</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="animate-slide-up shadow-lg border border-purple-300">
                <CardHeader className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-purple-700 text-xl font-semibold">Regulation {selectedRegulation}</CardTitle>
                    <CardDescription className="text-muted-foreground">Track curriculum submission status</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedRegulation(null)}>← Back</Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">+ Add Regulation</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-purple-700">Add New Regulation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input placeholder="Regulation Code (e.g., R24)" value={newRegulationCode} onChange={(e) => setNewRegulationCode(e.target.value)} />
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleCreateRegulation}>Create Regulation</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border rounded-md overflow-hidden text-sm">
                      <thead className="bg-muted text-foreground">
                        <tr>
                          <th className="text-left p-2">Department</th>
                          <th className="text-left p-2">HOD</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Last Updated</th>
                          <th className="text-left p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(regulations[selectedRegulation]) && (() => {
                          const grouped = regulations[selectedRegulation]!.reduce(
                            (acc: Record<string, DepartmentItem[]>, item) => {
                              const key = item.department;
                              if (!acc[key]) acc[key] = [];
                              acc[key].push(item);
                              return acc;
                            },
                            {}
                          );

                          return Object.values(grouped).map((deptVersions, index) => (
                            <CurriculumRow key={index} deptVersions={deptVersions} />
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        );
      }

      default:
        return <div>Content for {activeTab}</div>
    }
  };

  return (
    <DashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  )
}
