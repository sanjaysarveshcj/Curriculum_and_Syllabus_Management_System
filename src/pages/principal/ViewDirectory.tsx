// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useDirectoryStore, DirectoryItem } from '../../store/directoryStore';
// import { Button } from '../../components/ui/Button';
// import { Badge } from '../../components/ui/Badge';
// import { 
//   ChevronRight, 
//   ChevronDown, 
//   Folder, 
//   FolderOpen, 
//   File, 
//   Trash2,
//   Search
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// const ViewDirectory = () => {
//   const { items, getChildrenOf, deleteDirectory } = useDirectoryStore();
//   const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const toggleExpand = (id: string) => {
//     setExpandedItems(prev => {
//       const next = new Set(prev);
//       if (next.has(id)) {
//         next.delete(id);
//       } else {
//         next.add(id);
//       }
//       return next;
//     });
//   };
  
//   const handleDelete = (item: DirectoryItem) => {
//     if (confirm(`Are you sure you want to delete ${item.name}? This will also delete all its contents.`)) {
//       try {
//         deleteDirectory(item.id);
//         toast.success(`${item.name} deleted successfully`);
//       } catch (error) {
//         toast.error('Failed to delete directory');
//       }
//     }
//   };
  
//   const getTypeColor = (type: DirectoryItem['type']) => {
//     switch (type) {
//       case 'department':
//         return 'primary';
//       case 'regulation':
//         return 'secondary';
//       case 'semester':
//         return 'accent';
//       case 'subject':
//         return 'success';
//       case 'syllabus':
//         return 'warning';
//       default:
//         return 'default';
//     }
//   };
  
//   const renderDirectory = (parentId: string | null, level = 0) => {
//     const children = getChildrenOf(parentId).filter(item =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     if (children.length === 0) return null;
    
//     return (
//       <div className="space-y-1">
//         {children.map((item) => {
//           const hasChildren = getChildrenOf(item.id).length > 0;
//           const isExpanded = expandedItems.has(item.id);
          
//           return (
//             <div key={item.id}>
//               <div 
//                 className={`flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors ${
//                   hasChildren ? 'cursor-pointer hover:bg-secondary/50' : ''
//                 }`}
//                 style={{ paddingLeft: `${level * 20 + 8}px` }}
//                 onClick={() => hasChildren && toggleExpand(item.id)}
//               >
//                 <div className="flex-shrink-0">
//                   {hasChildren ? (
//                     isExpanded ? (
//                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
//                     ) : (
//                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                     )
//                   ) : (
//                     <div className="w-4" />
//                   )}
//                 </div>
                
//                 <div className="flex-shrink-0">
//                   {hasChildren ? (
//                     isExpanded ? (
//                       <FolderOpen className="h-4 w-4 text-muted-foreground" />
//                     ) : (
//                       <Folder className="h-4 w-4 text-muted-foreground" />
//                     )
//                   ) : (
//                     <File className="h-4 w-4 text-muted-foreground" />
//                   )}
//                 </div>
                
//                 <span className="flex-grow">{item.name}</span>
                
//                 <div className="flex items-center space-x-2">
//                   <Badge variant={getTypeColor(item.type)}>
//                     {item.type}
//                   </Badge>
                  
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="opacity-0 group-hover:opacity-100 transition-opacity"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDelete(item);
//                     }}
//                   >
//                     <Trash2 className="h-4 w-4 text-destructive" />
//                   </Button>
//                 </div>
//               </div>
              
//               {isExpanded && renderDirectory(item.id, level + 1)}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };
  
//   return (
//     <div className="space-y-6">
//       <motion.div
//         className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div>
//           <h1 className="text-2xl font-bold">View Directory</h1>
//           <p className="text-muted-foreground">Browse and manage the directory structure</p>
//         </div>
        
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <input
//             type="text"
//             placeholder="Search directories..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="form-input pl-9"
//           />
//         </div>
//       </motion.div>
      
//       <motion.div
//         className="card"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3, delay: 0.1 }}
//       >
//         <div className="card-header">
//           <div className="flex items-center justify-between">
//             <h2 className="card-title text-xl">Directory Structure</h2>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setExpandedItems(new Set())}
//             >
//               Collapse All
//             </Button>
//           </div>
//         </div>
        
//         <div className="card-content">
//           {renderDirectory(null)}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default ViewDirectory;


import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDirectoryStore, DirectoryItem } from '../../store/directoryStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  File, 
  Trash2,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const ViewDirectory = () => {
  const { items, getChildrenOf, deleteDirectory } = useDirectoryStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const handleDelete = (item: DirectoryItem) => {
    if (confirm(`Are you sure you want to delete ${item.name}? This will also delete all its contents.`)) {
      try {
        deleteDirectory(item.id);
        toast.success(`${item.name} deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete directory');
      }
    }
  };
  
  const getTypeColor = (type: DirectoryItem['type']) => {
    switch (type) {
      case 'department':
        return 'primary';
      case 'regulation':
        return 'secondary';
      case 'semester':
        return 'accent';
      case 'subject':
        return 'success';
      case 'syllabus':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const renderDirectory = (parentId: string | null, level = 0) => {
    const children = getChildrenOf(parentId).filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (children.length === 0) return null;
    
    return (
      <div className="space-y-1">
        {children.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const hasChildren = !item.isFile && getChildrenOf(item.id).length > 0;

          return (
            <div key={item.id}>
              <div 
                className={`flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors ${
                  !item.isFile ? 'cursor-pointer hover:bg-secondary/50' : ''
                }`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={() => !item.isFile && toggleExpand(item.id)}
              >
                <div className="flex-shrink-0">
                  {!item.isFile ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )
                  ) : (
                    <div className="w-4" />
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {item.isFile ? (
                    <File className="h-4 w-4 text-muted-foreground" />
                  ) : isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <span className="flex-grow">{item.name}</span>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              
              {!item.isFile && isExpanded && renderDirectory(item.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
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
          <h1 className="text-2xl font-bold">View Directory</h1>
          <p className="text-muted-foreground">Browse and manage the directory structure</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search directories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </motion.div>
      
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-xl">Directory Structure</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedItems(new Set())}
            >
              Collapse All
            </Button>
          </div>
        </div>
        
        <div className="card-content">
          {renderDirectory(null)}
        </div>
      </motion.div>
    </div>
  );
};

export default ViewDirectory;
