import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type UserRole = 'principal' | 'hod' | 'faculty' | 'classadvisor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getCurrentUser: () => User | null;
}

// Mock users for demonstration
const mockUsers = [
  { id: '1', name: 'Principal User', email: 'principal@example.com', password: 'password', role: 'principal' as UserRole },
  { id: '2', name: 'HOD User', email: 'hod@example.com', password: 'password', role: 'hod' as UserRole, department: 'Computer Science' },
  { id: '3', name: 'Faculty User', email: 'faculty@example.com', password: 'password', role: 'faculty' as UserRole, department: 'Computer Science' },
  { id: '4', name: 'Class Advisor User', email: 'advisor@example.com', password: 'password', role: 'classadvisor' as UserRole, department: 'Computer Science' },
];

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        userRole: null,
        
        login: async (email: string, password: string) => {
          // Simulate API call with mock data
          const user = mockUsers.find(u => u.email === email && u.password === password);
          
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            set({
              user: userWithoutPassword,
              isAuthenticated: true,
              userRole: userWithoutPassword.role
            });
            return true;
          }
          return false;
        },
        
        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            userRole: null
          });
        },
        
        getCurrentUser: () => {
          return get().user;
        }
      }),
      {
        name: 'auth-storage',
        // Don't persist sensitive data like passwords or tokens in localStorage
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          userRole: state.userRole
        }),
      }
    )
  )
);