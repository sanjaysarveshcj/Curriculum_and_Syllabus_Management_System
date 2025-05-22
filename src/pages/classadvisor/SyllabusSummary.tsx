import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSyllabusStore } from '../../store/syllabusStore';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getStatusText } from '../../lib/utils';
import { Download, BarChart3, PieChart } from 'lucide-react';

const SyllabusSummary = () => {
  const { forms } = useSyllabusStore();
  const { getCurrentUser } = useAuthStore();
  const currentUser = getCurrentUser();
  
  // Filter forms by the current advisor's department
  const departmentForms = forms.filter(
    form => form.department === currentUser?.department
  );
  
  // Calculate statistics
  const totalSyllabi = departmentForms.length;
  const approvedSyllabi = departmentForms.filter(form => form.status === 'approved').length;
  const pendingSyllabi = departmentForms.filter(form => form.status === 'pending').length;
  const rejectedSyllabi = departmentForms.filter(form => form.status === 'rejected').length;
  
  const approvalRate = totalSyllabi > 0 ? Math.round((approvedSyllabi / totalSyllabi) * 100) : 0;
  
  // Ensure we have a fallback color for chart segments
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
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
          <h1 className="text-2xl font-bold">Syllabus Summary</h1>
          <p className="text-muted-foreground">
            Overview of all syllabus submissions for {currentUser?.department || 'department'}
          </p>
        </div>
        
        <Button variant="outline" size="sm" className="self-start">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </motion.div>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="card bg-secondary/20">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Syllabi</p>
                <h3 className="text-3xl font-bold">{totalSyllabi}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-success/20">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Approved</p>
                <h3 className="text-3xl font-bold">{approvedSyllabi}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                <Badge 
                  variant="success" 
                  className="px-2 py-1 text-[10px]"
                >
                  {approvalRate}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-warning/20">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending</p>
                <h3 className="text-3xl font-bold">{pendingSyllabi}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                <Badge 
                  status="pending"
                  className="px-2 py-1 text-[10px]"
                >
                  {totalSyllabi > 0 ? Math.round((pendingSyllabi / totalSyllabi) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-destructive/20">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Rejected</p>
                <h3 className="text-3xl font-bold">{rejectedSyllabi}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Badge 
                  status="rejected"
                  className="px-2 py-1 text-[10px]"
                >
                  {totalSyllabi > 0 ? Math.round((rejectedSyllabi / totalSyllabi) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="card-header">
            <h2 className="card-title">Status Distribution</h2>
            <p className="card-description">Breakdown of syllabus status</p>
          </div>
          
          <div className="card-content flex items-center justify-center p-6">
            <div className="flex items-center justify-center relative h-44 w-44">
              {/* Simulate a pie chart with CSS */}
              <div className="relative h-full w-full rounded-full overflow-hidden">
                {totalSyllabi > 0 ? (
                  <div className="flex h-full">
                    {approvedSyllabi > 0 && (
                      <div
                        className="bg-success h-full"
                        style={{ width: `${(approvedSyllabi / totalSyllabi) * 100}%` }}
                      ></div>
                    )}
                    {pendingSyllabi > 0 && (
                      <div
                        className="bg-warning h-full"
                        style={{ width: `${(pendingSyllabi / totalSyllabi) * 100}%` }}
                      ></div>
                    )}
                    {rejectedSyllabi > 0 && (
                      <div
                        className="bg-destructive h-full"
                        style={{ width: `${(rejectedSyllabi / totalSyllabi) * 100}%` }}
                      ></div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full">
                    <div className="bg-muted h-full w-full"></div>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <PieChart className="h-10 w-10 text-muted-foreground/50" />
              </div>
            </div>
            
            <div className="ml-8 space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full bg-success`}></div>
                <span className="text-sm">Approved ({approvedSyllabi})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full bg-warning`}></div>
                <span className="text-sm">Pending ({pendingSyllabi})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full bg-destructive`}></div>
                <span className="text-sm">Rejected ({rejectedSyllabi})</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="card-header">
            <h2 className="card-title">Recent Syllabi</h2>
            <p className="card-description">Latest syllabus submissions</p>
          </div>
          
          <div className="card-content p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary/50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Faculty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {departmentForms.length > 0 ? (
                    departmentForms
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 5)
                      .map((form, index) => (
                        <motion.tr 
                          key={form.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 + (0.05 * index) }}
                          className="hover:bg-secondary/30"
                        >
                          <td className="px-4 py-3 font-medium">{form.subject}</td>
                          <td className="px-4 py-3 text-muted-foreground">{form.faculty}</td>
                          <td className="px-4 py-3">
                            <Badge status={form.status as any}>
                              {getStatusText(form.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {form.updatedAt.toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                        No syllabus submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SyllabusSummary;