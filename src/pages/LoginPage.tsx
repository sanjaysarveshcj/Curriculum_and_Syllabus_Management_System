import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Mail, Lock, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated, login } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success('Login successful');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">Syllabus Management System</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input pl-10"
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
        
        
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;