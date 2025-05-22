import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Generate a random ID for entities
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Simple validation utilities
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password: string) => {
  return password.length >= 6;
};

// Status helpers
export type Status = 'pending' | 'approved' | 'rejected';

export const getStatusColor = (status: Status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const getStatusText = (status: Status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};