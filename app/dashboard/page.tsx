"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/superuser-dashboard";
import HODDashboard from "@/components/hod-dashboard";
import FacultyDashboard from "@/components/faculty-dashboard";
import SubjectExpertDashboard from "@/components/subject-expert-dashboard";

interface User {
  _id: string
  email: string;
  role: string[]; // User may have multiple roles
  name: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard useEffect running...");

    const userData = localStorage.getItem("user");
    const roleData = localStorage.getItem("selectedRole");
    console.log(localStorage.getItem("selectedRole"));


    if (userData && roleData) {
      const parsedUser: User = JSON.parse(userData);
      const validRoles = ["superuser", "hod", "faculty", "subject-expert"];

      if (!validRoles.includes(roleData)) {
        console.warn("Invalid selected role");
        router.push("/login");
        return;
      }

      if (!parsedUser.role.includes(roleData)) {
        console.warn("Selected role not assigned to user");
        router.push("/login");
        return;
      }

      console.log("User and role are valid.");
      setUser(parsedUser); // ✅ Fix: Set user state
      setSelectedRole(roleData); // ✅ Fix: Set role state
    } else {
      console.log("Nothing in localStorage");
      router.push("/login");
    }
  }, [router]);

  if (!user || !selectedRole) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Convert to single-role object for dashboard props compatibility
  const userWithSingleRole = {
    ...user,
    role: selectedRole,
  };

  switch (selectedRole) {
    case "superuser":
      return <AdminDashboard user={userWithSingleRole} />;
    case "hod":
      return <HODDashboard user={userWithSingleRole} />;
    case "faculty":
      return <FacultyDashboard user={userWithSingleRole} />;
    case "subject-expert":
      return <SubjectExpertDashboard user={userWithSingleRole} />;
    default:
      return (
        <div className="text-center text-white text-lg mt-10">
          Invalid role selected
        </div>
      );
  }
}
