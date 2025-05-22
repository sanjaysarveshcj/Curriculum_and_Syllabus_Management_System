import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Book, 
  BarChart
} from 'lucide-react';

const ClassAdvisorDashboard = () => {
  const sidebarLinks = [
    {
      path: '/classadvisor/view-subjects',
      label: 'View Subjects',
      icon: <Book className="h-5 w-5" />,
    },
    {
      path: '/classadvisor/syllabus-summary',
      label: 'Syllabus Summary',
      icon: <BarChart className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout 
      sidebarTitle="Class Advisor Dashboard" 
      sidebarLinks={sidebarLinks} 
    />
  );
};

export default ClassAdvisorDashboard;