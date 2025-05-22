// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useDirectoryStore } from '../../store/directoryStore';
// import { Button } from '../../components/ui/Button';
// import { FolderPlus, ChevronRight, X } from 'lucide-react';
// import toast from 'react-hot-toast';

// type DirectoryType = 'department' | 'regulation' | 'semester' | 'subject' | 'syllabus';

// const CreateDirectory = () => {
//   const { addDirectory, getDirectory, getChildrenOf } = useDirectoryStore();
//   const [selectedType, setSelectedType] = useState<DirectoryType>('department');
//   const [name, setName] = useState('');
//   const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Get available parent directories based on selected type
//   const getAvailableParents = () => {
//     switch (selectedType) {
//       case 'regulation':
//         return getChildrenOf(null).filter(item => item.type === 'department');
//       case 'semester':
//         return getChildrenOf(selectedParentId).filter(item => item.type === 'regulation');
//       case 'subject':
//         return getChildrenOf(selectedParentId).filter(item => item.type === 'semester');
//       case 'syllabus':
//         return getChildrenOf(selectedParentId).filter(item => item.type === 'subject');
//       default:
//         return [];
//     }
//   };
  
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name.trim()) {
//       toast.error('Please enter a name');
//       return;
//     }
    
//     if (selectedType !== 'department' && !selectedParentId) {
//       toast.error('Please select a parent directory');
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       const id = addDirectory(name, selectedType, selectedParentId);
//       const parent = selectedParentId ? getDirectory(selectedParentId) : null;
      
//       toast.success(
//         `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} created successfully${
//           parent ? ` under ${parent.name}` : ''
//         }`
//       );
      
//       // Reset form
//       setName('');
//       if (selectedType === 'department') {
//         setSelectedParentId(null);
//       }
//     } catch (error) {
//       toast.error('Failed to create directory');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const handleTypeChange = (type: DirectoryType) => {
//     setSelectedType(type);
//     setSelectedParentId(null);
//   };
  
//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <h1 className="text-2xl font-bold">Create Directory</h1>
//         <p className="text-muted-foreground">
//           Create and organize departments, regulations, semesters, and subjects
//         </p>
//       </motion.div>
      
//       <motion.div
//         className="grid grid-cols-1 md:grid-cols-2 gap-8"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3, delay: 0.1 }}
//       >
//         <div className="card">
//           <div className="card-header">
//             <h2 className="card-title text-xl">Directory Details</h2>
//             <p className="card-description">Enter the details for the new directory</p>
//           </div>
          
//           <form onSubmit={handleSubmit} className="card-content space-y-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Directory Type</label>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                 {['department', 'regulation', 'semester', 'subject', 'syllabus'].map((type) => (
//                   <Button
//                     key={type}
//                     type="button"
//                     variant={selectedType === type ? 'secondary' : 'outline'}
//                     size="sm"
//                     onClick={() => handleTypeChange(type as DirectoryType)}
//                   >
//                     {type.charAt(0).toUpperCase() + type.slice(1)}
//                   </Button>
//                 ))}
//               </div>
//             </div>
            
//             {selectedType !== 'department' && (
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">
//                   Select Parent {selectedType === 'regulation' ? 'Department' : 
//                               selectedType === 'semester' ? 'Regulation' :
//                               selectedType === 'subject' ? 'Semester' : 'Subject'}
//                 </label>
//                 <div className="space-y-2">
//                   {getAvailableParents().map((parent) => (
//                     <button
//                       key={parent.id}
//                       type="button"
//                       onClick={() => setSelectedParentId(parent.id)}
//                       className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
//                         selectedParentId === parent.id
//                           ? 'bg-secondary text-secondary-foreground'
//                           : 'hover:bg-secondary/50'
//                       }`}
//                     >
//                       <div className="flex items-center">
//                         <ChevronRight className="h-4 w-4 mr-2" />
//                         <span>{parent.name}</span>
//                       </div>
//                     </button>
//                   ))}
//                   {getAvailableParents().length === 0 && (
//                     <p className="text-sm text-muted-foreground px-4 py-2">
//                       No available parent directories found
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}
            
//             <div className="space-y-2">
//               <label htmlFor="name" className="text-sm font-medium">
//                 Name
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="form-input"
//                 placeholder={`Enter ${selectedType} name`}
//               />
//             </div>
            
//             <div className="pt-4">
//               <Button
//                 type="submit"
//                 className="w-full"
//                 isLoading={isLoading}
//               >
//                 <FolderPlus className="h-4 w-4 mr-2" />
//                 Create {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
//               </Button>
//             </div>
//           </form>
//         </div>
        
//         <div className="space-y-6">
//           <div className="card">
//             <div className="card-header">
//               <h2 className="card-title text-xl">Directory Structure</h2>
//               <p className="card-description">How directories are organized</p>
//             </div>
            
//             <div className="card-content">
//               <div className="space-y-4">
//                 <div className="flex items-start space-x-3">
//                   <div className="mt-1 bg-secondary/50 p-2 rounded">
//                     <FolderPlus className="h-5 w-5 text-primary" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium">Hierarchical Organization</h3>
//                     <p className="text-sm text-muted-foreground">
//                       Directories follow a strict hierarchy:
//                       Department → Regulation → Semester → Subject → Syllabus
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="pl-4 border-l-2 border-dashed space-y-2">
//                   <div className="flex items-center space-x-2">
//                     <div className="h-2 w-2 rounded-full bg-primary"></div>
//                     <span className="text-sm">Department (e.g., Computer Science)</span>
//                   </div>
//                   <div className="flex items-center space-x-2 pl-4">
//                     <div className="h-2 w-2 rounded-full bg-secondary"></div>
//                     <span className="text-sm">Regulation (e.g., 2022)</span>
//                   </div>
//                   <div className="flex items-center space-x-2 pl-8">
//                     <div className="h-2 w-2 rounded-full bg-accent"></div>
//                     <span className="text-sm">Semester (e.g., Semester 1)</span>
//                   </div>
//                   <div className="flex items-center space-x-2 pl-12">
//                     <div className="h-2 w-2 rounded-full bg-success"></div>
//                     <span className="text-sm">Subject (e.g., Data Structures)</span>
//                   </div>
//                   <div className="flex items-center space-x-2 pl-16">
//                     <div className="h-2 w-2 rounded-full bg-warning"></div>
//                     <span className="text-sm">Syllabus (PDF files)</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="card bg-primary/5 border-primary/20">
//             <div className="card-header">
//               <h2 className="card-title text-xl">Tips</h2>
//             </div>
            
//             <div className="card-content space-y-2">
//               <p className="text-sm">
//                 Start by creating departments, then add regulations under them. Continue with semesters and subjects to build your directory structure.
//               </p>
//               <p className="text-sm">
//                 Use clear, consistent naming conventions for better organization.
//               </p>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default CreateDirectory;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDirectoryStore } from '../../store/directoryStore';
import { Button } from '../../components/ui/Button';
import { FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';

type DirectoryType = 'department' | 'regulation' | 'semester' | 'subject' | 'syllabus';

const CreateDirectory = () => {
  const { addDirectory, getChildrenOf } = useDirectoryStore();
  const [selectedType, setSelectedType] = useState<DirectoryType>('department');
  const [name, setName] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedRegulationId, setSelectedRegulationId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeChange = (type: DirectoryType) => {
    setSelectedType(type);
    setSelectedDepartmentId(null);
    setSelectedRegulationId(null);
    setSelectedSemesterId(null);
    setSelectedSubjectId(null);
  };

  const getParentId = () => {
    switch (selectedType) {
      case 'regulation': return selectedDepartmentId;
      case 'semester': return selectedRegulationId;
      case 'subject': return selectedSemesterId;
      case 'syllabus': return selectedSubjectId;
      default: return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter a name');

    const parentId = getParentId();
    if (selectedType !== 'department' && !parentId) {
      toast.error('Please select all parent directories');
      return;
    }

    setIsLoading(true);
    try {
      const isFile = selectedType === 'syllabus';
      addDirectory(name, selectedType, parentId, isFile);
      toast.success(`${selectedType} created successfully`);
      setName('');
    } catch {
      toast.error('Failed to create directory');
    } finally {
      setIsLoading(false);
    }
  };

  const departments = getChildrenOf(null).filter((item) => item.type === 'department');
  const regulations = selectedDepartmentId
    ? getChildrenOf(selectedDepartmentId).filter((item) => item.type === 'regulation')
    : [];
  const semesters = selectedRegulationId
    ? getChildrenOf(selectedRegulationId).filter((item) => item.type === 'semester')
    : [];
  const subjects = selectedSemesterId
    ? getChildrenOf(selectedSemesterId).filter((item) => item.type === 'subject')
    : [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Create Directory</h1>
        <p className="text-muted-foreground">
          Create and organize departments, regulations, semesters, subjects, and syllabus files
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Left Form Section */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Directory Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['department', 'regulation', 'semester', 'subject', 'syllabus'].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={selectedType === type ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange(type as DirectoryType)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Multi-Level Parent Selection */}
          {selectedType !== 'department' && (
            <div className="space-y-2">
              {['regulation', 'semester', 'subject', 'syllabus'].includes(selectedType) && (
                <select
                  value={selectedDepartmentId || ''}
                  onChange={(e) => {
                    setSelectedDepartmentId(e.target.value || null);
                    setSelectedRegulationId(null);
                    setSelectedSemesterId(null);
                    setSelectedSubjectId(null);
                  }}
                  className="form-input"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}

              {['semester', 'subject', 'syllabus'].includes(selectedType) && (
                <select
                  value={selectedRegulationId || ''}
                  onChange={(e) => {
                    setSelectedRegulationId(e.target.value || null);
                    setSelectedSemesterId(null);
                    setSelectedSubjectId(null);
                  }}
                  className="form-input"
                  disabled={!selectedDepartmentId}
                >
                  <option value="">Select Regulation</option>
                  {regulations.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}

              {['subject', 'syllabus'].includes(selectedType) && (
                <select
                  value={selectedSemesterId || ''}
                  onChange={(e) => {
                    setSelectedSemesterId(e.target.value || null);
                    setSelectedSubjectId(null);
                  }}
                  className="form-input"
                  disabled={!selectedRegulationId}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}

              {['syllabus'].includes(selectedType) && (
                <select
                  value={selectedSubjectId || ''}
                  onChange={(e) => setSelectedSubjectId(e.target.value || null)}
                  className="form-input"
                  disabled={!selectedSemesterId}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder={`Enter ${selectedType} name`}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create {selectedType}
            </Button>
          </div>
        </form>

        {/* Right Info Section */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title text-xl">Directory Structure</h2>
              <p className="card-description">How directories are organized</p>
            </div>
            <div className="card-content space-y-4">
              <p className="text-sm">
                The directory structure follows this strict hierarchy:
              </p>
              <ul className="text-sm pl-4 list-disc space-y-1">
                <li><strong>Department</strong> (e.g., Computer Science)</li>
                <li className="pl-4">↳ <strong>Regulation</strong> (e.g., 2022)</li>
                <li className="pl-8">↳ <strong>Semester</strong> (e.g., Semester 1)</li>
                <li className="pl-12">↳ <strong>Subject</strong> (e.g., Data Structures)</li>
                <li className="pl-16">↳ <strong>Syllabus</strong> (PDF file)</li>
              </ul>
            </div>
          </div>

          <div className="card bg-primary/5 border-primary/20">
            <div className="card-header">
              <h2 className="card-title text-xl">Tips</h2>
            </div>
            <div className="card-content space-y-2 text-sm">
              <p>Start by creating a Department, then follow the structure down to Syllabus.</p>
              <p>Use consistent naming (e.g., "Semester 1", "Regulation 2023").</p>
              <p>Only "Syllabus" is treated as a file. Others are folders.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateDirectory;

