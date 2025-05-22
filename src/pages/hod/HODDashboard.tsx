import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  UserPlus, 
  BookOpen, 
  Users
} from 'lucide-react';

const HODDashboard = () => {
  const sidebarLinks = [
    {
      path: '/hod/create-class-advisor',
      label: 'Create Class Advisor',
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      path: '/hod/create-faculty',
      label: 'Create Subject Faculty',
      icon: <Users className="h-5 w-5" />,
    },
    {
      path: '/hod/approve-syllabus',
      label: 'Approve Syllabus',
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout 
      sidebarTitle="HOD Dashboard" 
      sidebarLinks={sidebarLinks} 
    />
  );
};

export default HODDashboard;