import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';

type SidebarLink = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  links: SidebarLink[];
  title: string;
};

const Sidebar = ({ links, title }: SidebarProps) => {
  const location = useLocation();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div 
      className="h-screen w-64 bg-card border-r fixed left-0 top-0 z-10 flex flex-col"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`sidebar-link ${
                  location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path))
                    ? 'active'
                    : ''
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start" 
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-destructive" 
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;