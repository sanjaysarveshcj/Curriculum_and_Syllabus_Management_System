import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { isValidEmail } from '../../lib/utils';
import toast from 'react-hot-toast';
import { FileCheck, User } from 'lucide-react';

const CreateHOD = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { addUser } = useUserStore();
  const { getCurrentUser } = useAuthStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !department) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current user (principal) for createdBy field
      const currentUser = getCurrentUser();
      
      // Add the new HOD user
      addUser({
        name,
        email,
        password,
        role: 'hod',
        department,
        createdBy: currentUser?.id,
      });
      
      toast.success('HOD created successfully');
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setDepartment('');
    } catch (error) {
      toast.error('Failed to create HOD');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold">Create HOD</h1>
          <p className="text-muted-foreground">Add a new Head of Department to the system</p>
        </motion.div>
      </div>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-xl">HOD Details</h2>
            <p className="card-description">Enter the details for the new HOD</p>
          </div>
          
          <form onSubmit={handleSubmit} className="card-content space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter password"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-input"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Create HOD
              </Button>
            </div>
          </form>
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title text-xl">HOD Responsibilities</h2>
              <p className="card-description">What can an HOD do in the system?</p>
            </div>
            
            <div className="card-content space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-secondary/50 p-2 rounded">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Create Users</h3>
                  <p className="text-sm text-muted-foreground">HODs can create class advisors and subject faculty</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-secondary/50 p-2 rounded">
                  <FileCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-medium">Approve Syllabi</h3>
                  <p className="text-sm text-muted-foreground">HODs review and approve/reject syllabus submissions from faculty</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-primary/5 border-primary/20">
            <div className="card-header">
              <h2 className="card-title text-xl">Information</h2>
            </div>
            
            <div className="card-content space-y-2">
              <p className="text-sm">
                Once created, HODs will receive their login credentials via email. They can then log in to the system and start managing their department.
              </p>
              <p className="text-sm">
                Each department should have exactly one HOD assigned to it.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateHOD;