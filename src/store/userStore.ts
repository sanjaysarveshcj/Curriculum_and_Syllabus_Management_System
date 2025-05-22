import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export type UserRole = 'principal' | 'hod' | 'faculty' | 'classadvisor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed and not stored in the client
  role: UserRole;
  department?: string;
  createdAt: Date;
  createdBy?: string;
}

interface UserState {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => string;
  updateUser: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => boolean;
  deleteUser: (id: string) => boolean;
  getUsersByRole: (role: UserRole) => User[];
  getUsersByDepartment: (department: string) => User[];
}

// Mock initial users
const initialUsers: User[] = [
  {
    id: '1',
    name: 'Principal User',
    email: 'principal@example.com',
    password: 'password', // In a real app, this would be hashed
    role: 'principal',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'HOD User',
    email: 'hod@example.com',
    password: 'password',
    role: 'hod',
    department: 'Computer Science',
    createdAt: new Date(),
    createdBy: '1',
  },
  {
    id: '3',
    name: 'Faculty User',
    email: 'faculty@example.com',
    password: 'password',
    role: 'faculty',
    department: 'Computer Science',
    createdAt: new Date(),
    createdBy: '2',
  },
  {
    id: '4',
    name: 'Class Advisor User',
    email: 'advisor@example.com',
    password: 'password',
    role: 'classadvisor',
    department: 'Computer Science',
    createdAt: new Date(),
    createdBy: '2',
  },
];

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        users: initialUsers,
        
        addUser: (user) => {
          const id = generateId();
          
          set((state) => ({
            users: [
              ...state.users,
              {
                ...user,
                id,
                createdAt: new Date(),
              },
            ],
          }));
          
          return id;
        },
        
        updateUser: (id, updates) => {
          let updated = false;
          
          set((state) => {
            const userIndex = state.users.findIndex((user) => user.id === id);
            
            if (userIndex === -1) return state;
            
            const updatedUsers = [...state.users];
            updatedUsers[userIndex] = {
              ...updatedUsers[userIndex],
              ...updates,
            };
            
            updated = true;
            return { users: updatedUsers };
          });
          
          return updated;
        },
        
        deleteUser: (id) => {
          let deleted = false;
          
          set((state) => {
            const userIndex = state.users.findIndex((user) => user.id === id);
            
            if (userIndex === -1) return state;
            
            const updatedUsers = state.users.filter((user) => user.id !== id);
            deleted = true;
            
            return { users: updatedUsers };
          });
          
          return deleted;
        },
        
        getUsersByRole: (role) => {
          return get().users.filter((user) => user.role === role);
        },
        
        getUsersByDepartment: (department) => {
          return get().users.filter((user) => user.department === department);
        },
      }),
      {
        name: 'user-storage',
      }
    )
  )
);