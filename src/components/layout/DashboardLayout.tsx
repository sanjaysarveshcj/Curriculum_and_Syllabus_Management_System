import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

type DashboardLayoutProps = {
  sidebarTitle: string;
  sidebarLinks: {
    path: string;
    label: string;
    icon: ReactNode;
  }[];
  children?: ReactNode;
};

const DashboardLayout = ({ sidebarTitle, sidebarLinks, children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar title={sidebarTitle} links={sidebarLinks} />
      
      <motion.main 
        className="flex-1 ml-64 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children || <Outlet />}
      </motion.main>
    </div>
  );
};

export default DashboardLayout;