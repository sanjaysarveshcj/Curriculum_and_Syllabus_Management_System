import { useState } from 'react';
import { motion } from 'framer-motion';
import { SyllabusForm, useSyllabusStore } from '../../store/syllabusStore';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Status, getStatusColor, getStatusText } from '../../lib/utils';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

const ApproveSyllabus = () => {
  const { forms, updateStatus } = useSyllabusStore();
  const { getCurrentUser } = useAuthStore();
  const currentUser = getCurrentUser();
  
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [commentText, setCommentText] = useState('');
  const [selectedForm, setSelectedForm] = useState<SyllabusForm | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Filter forms by the current HOD's department
  const departmentForms = forms.filter(
    form => form.department === currentUser?.department
  );
  
  // Apply status filter if not 'all'
  const filteredForms = selectedStatus === 'all'
    ? departmentForms
    : departmentForms.filter(form => form.status === selectedStatus);
  
  const handleStatusChange = (status: Status | 'all') => {
    setSelectedStatus(status);
  };
  
  const handleViewDetails = (form: SyllabusForm) => {
    setSelectedForm(form);
    setIsPreviewOpen(true);
    setCommentText(form.comments || '');
  };
  
  const handleApprove = () => {
    if (!selectedForm || !currentUser) return;
    
    try {
      updateStatus(selectedForm.id, 'approved', currentUser.id, commentText);
      toast.success(`${selectedForm.title} has been approved`);
      setIsPreviewOpen(false);
      setSelectedForm(null);
    } catch (error) {
      toast.error('Failed to approve syllabus');
    }
  };
  
  const handleReject = () => {
    if (!selectedForm || !currentUser) return;
    
    if (!commentText.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }
    
    try {
      updateStatus(selectedForm.id, 'rejected', currentUser.id, commentText);
      toast.success(`${selectedForm.title} has been rejected`);
      setIsPreviewOpen(false);
      setSelectedForm(null);
    } catch (error) {
      toast.error('Failed to reject syllabus');
    }
  };
  
  const closePreviewer = () => {
    setIsPreviewOpen(false);
    setSelectedForm(null);
    setCommentText('');
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Approve Syllabus</h1>
          <p className="text-muted-foreground">Review and approve syllabus submissions from faculty</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('all')}
          >
            All
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('pending')}
          >
            Pending
          </Button>
          <Button
            variant={selectedStatus === 'approved' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('approved')}
          >
            Approved
          </Button>
          <Button
            variant={selectedStatus === 'rejected' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('rejected')}
          >
            Rejected
          </Button>
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
                <th className="px-4 py-3 text-sm font-medium">Subject</th>
                <th className="px-4 py-3 text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-sm font-medium">Faculty</th>
                <th className="px-4 py-3 text-sm font-medium">Semester</th>
                <th className="px-4 py-3 text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredForms.length > 0 ? (
                filteredForms.map((form, index) => (
                  <motion.tr 
                    key={form.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 * index }}
                    className="hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3 font-medium">{form.subject}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate">{form.title}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{form.faculty}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Semester {form.semester}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={form.status as any}>
                        {getStatusText(form.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(form)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    {selectedStatus === 'all'
                      ? 'No syllabus submissions found'
                      : `No ${selectedStatus} submissions found`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Syllabus Preview Modal */}
      {isPreviewOpen && selectedForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedForm.title}</h2>
              <Badge status={selectedForm.status as any}>
                {getStatusText(selectedForm.status)}
              </Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject Code</p>
                  <p>{selectedForm.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p>{selectedForm.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Regulation</p>
                  <p>{selectedForm.regulation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Semester</p>
                  <p>Semester {selectedForm.semester}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                  <p>{selectedForm.faculty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                  <p>{selectedForm.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Syllabus Content</h3>
                
                <div className="rounded-md border bg-secondary/20 p-4 space-y-4">
                  {Object.entries(selectedForm.content).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">PDF Preview</h3>
                  
                  <div className="border rounded-md h-64 flex items-center justify-center bg-secondary/20">
                    <div className="text-center space-y-2">
                      <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p className="text-muted-foreground">PDF preview would appear here in a real implementation</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="comments" className="text-sm font-medium">
                    Review Comments
                  </label>
                  <textarea
                    id="comments"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter your comments here..."
                    className="form-input min-h-[100px]"
                    disabled={selectedForm.status !== 'pending'}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-card flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={closePreviewer}>
                Close
              </Button>
              
              {selectedForm.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={handleApprove}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ApproveSyllabus;