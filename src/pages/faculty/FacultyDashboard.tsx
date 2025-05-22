import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  FileText, 
  ListChecks
} from 'lucide-react';

const FacultyDashboard = () => {
  const sidebarLinks = [
    {
      path: '/faculty/create-syllabus',
      label: 'Create Syllabus',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      path: '/faculty/view-submissions',
      label: 'View Submissions',
      icon: <ListChecks className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout 
      sidebarTitle="Faculty Dashboard" 
      sidebarLinks={sidebarLinks} 
    />
  );
};

export default FacultyDashboard;

