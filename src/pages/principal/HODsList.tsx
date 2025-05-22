import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { User, Trash2, Edit, MailCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const HODsList = () => {
  const { users, deleteUser, updateUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter HODs from all users
  const hods = users.filter(user => user.role === 'hod');
  
  // Filter by search term
  const filteredHODs = hods.filter(hod => 
    hod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hod.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hod.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const success = deleteUser(id);
      
      if (success) {
        toast.success(`${name} has been removed successfully`);
      } else {
        toast.error(`Failed to remove ${name}`);
      }
    }
  };
  
  const handleResendCredentials = (id: string, name: string) => {
    // In a real app, this would send an email with credentials
    toast.success(`Credentials sent to ${name}`);
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl font-bold">HODs List</h1>
          <p className="text-muted-foreground">Manage all Heads of Departments</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search HODs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
      </motion.div>
      
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-sm font-medium">Department</th>
                <th className="px-4 py-3 text-sm font-medium">Created At</th>
                <th className="px-4 py-3 text-sm font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredHODs.length > 0 ? (
                filteredHODs.map((hod, index) => (
                  <motion.tr 
                    key={hod.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 * index }}
                    className="hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{hod.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{hod.email}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge-secondary">
                        {hod.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hod.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendCredentials(hod.id, hod.name)}
                          title="Resend Credentials"
                        >
                          <MailCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast.error('Edit functionality is not implemented in this demo');
                          }}
                          title="Edit HOD"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(hod.id, hod.name)}
                          title="Delete HOD"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    {searchTerm ? 'No HODs found matching your search' : 'No HODs found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default HODsList;