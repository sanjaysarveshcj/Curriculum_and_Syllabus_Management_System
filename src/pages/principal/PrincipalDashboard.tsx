import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  FolderPlus, 
  FolderTree, 
  UserPlus 
} from 'lucide-react';

const PrincipalDashboard = () => {
  const sidebarLinks = [
    {
      path: '/principal/create-hod',
      label: 'Create HOD',
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      path: '/principal/create-directory',
      label: 'Create Directory',
      icon: <FolderPlus className="h-5 w-5" />,
    },
    {
      path: '/principal/view-directory',
      label: 'View Directory',
      icon: <FolderTree className="h-5 w-5" />,
    },
    {
      path: '/principal/hods-list',
      label: 'HODs List',
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout 
      sidebarTitle="Principal Dashboard" 
      sidebarLinks={sidebarLinks} 
    />
  );
};

export default PrincipalDashboard;