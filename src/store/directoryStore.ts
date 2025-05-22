// import { create } from 'zustand';
// import { devtools, persist } from 'zustand/middleware';
// import { generateId } from '../lib/utils';

// export type DirectoryItem = {
//   id: string;
//   name: string;
//   type: 'department' | 'regulation' | 'semester' | 'subject' | 'syllabus';
//   parentId: string | null;
//   isFile:boolean;
//   children: string[];
//   createdAt: Date;
//   updatedAt: Date;
// };

// interface DirectoryState {
//   items: Record<string, DirectoryItem>;
//   addDirectory: (name: string, type: DirectoryItem['type'], parentId: string | null) => string;
//   getDirectory: (id: string) => DirectoryItem | undefined;
//   getChildrenOf: (parentId: string | null) => DirectoryItem[];
//   getPath: (id: string) => DirectoryItem[];
//   deleteDirectory: (id: string) => void;
// }

// // Mock departments for initial state
// const initialDepartments = [
//   { name: 'Computer Science', type: 'department' as const },
//   { name: 'Electrical Engineering', type: 'department' as const },
//   { name: 'Mechanical Engineering', type: 'department' as const },
// ];

// // Create initial state with departments
// const createInitialItems = () => {
//   const items: Record<string, DirectoryItem> = {};
  
//   initialDepartments.forEach(dept => {
//     const id = generateId();
//     items[id] = {
//       id,
//       name: dept.name,
//       type: dept.type,
//       parentId: null,
//       children: [],
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };
//   });
  
//   return items;
// };

// export const useDirectoryStore = create<DirectoryState>()(
//   devtools(
//     persist(
//       (set, get) => ({
//         items: createInitialItems(),
        
//         addDirectory: (name, type, parentId) => {
//           const id = generateId();
//           const now = new Date();
          
//           set(state => {
//             const newItems = { ...state.items };
            
//             // Create the new directory item
//             newItems[id] = {
//               id,
//               name,
//               type,
//               parentId,
//               children: [],
//               createdAt: now,
//               updatedAt: now,
//             };
            
//             // Update parent's children array if parent exists
//             if (parentId && newItems[parentId]) {
//               newItems[parentId] = {
//                 ...newItems[parentId],
//                 children: [...newItems[parentId].children, id],
//                 updatedAt: now,
//               };
//             }
            
//             return { items: newItems };
//           });
          
//           return id;
//         },
        
//         getDirectory: (id) => {
//           return get().items[id];
//         },
        
//         getChildrenOf: (parentId) => {
//           return Object.values(get().items).filter(item => item.parentId === parentId);
//         },
        
//         getPath: (id) => {
//           const path: DirectoryItem[] = [];
//           let currentId: string | null = id;
          
//           while (currentId) {
//             const item = get().items[currentId];
//             if (!item) break;
            
//             path.unshift(item);
//             currentId = item.parentId;
//           }
          
//           return path;
//         },
        
//         deleteDirectory: (id) => {
//           set(state => {
//             const newItems = { ...state.items };
//             const itemToDelete = newItems[id];
            
//             if (!itemToDelete) return state;
            
//             // First recursively delete all children
//             const deleteRecursively = (itemId: string) => {
//               const item = newItems[itemId];
//               if (!item) return;
              
//               // Delete all children first
//               [...item.children].forEach(childId => {
//                 deleteRecursively(childId);
//               });
              
//               // Then delete this item
//               delete newItems[itemId];
//             };
            
//             deleteRecursively(id);
            
//             // Update parent's children array
//             if (itemToDelete.parentId && newItems[itemToDelete.parentId]) {
//               newItems[itemToDelete.parentId] = {
//                 ...newItems[itemToDelete.parentId],
//                 children: newItems[itemToDelete.parentId].children.filter(childId => childId !== id),
//                 updatedAt: new Date(),
//               };
//             }
            
//             return { items: newItems };
//           });
//         }
//       }),
//       {
//         name: 'directory-storage',
//       }
//     )
//   )
// );

import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type DirectoryType = 'department' | 'regulation' | 'semester' | 'subject' | 'syllabus';

export interface DirectoryItem {
  id: string;
  name: string;
  type: DirectoryType;
  parentId: string | null;
  isFile: boolean; // true only for syllabus
}

interface DirectoryStore {
  items: DirectoryItem[];
  addDirectory: (
    name: string,
    type: DirectoryType,
    parentId: string | null,
    isFile: boolean
  ) => string;
  deleteDirectory: (id: string) => void;
  getDirectory: (id: string) => DirectoryItem | undefined;
  getChildrenOf: (parentId: string | null) => DirectoryItem[];
}

export const useDirectoryStore = create<DirectoryStore>((set, get) => ({
  items: [],

  addDirectory: (name, type, parentId, isFile) => {
    const newItem: DirectoryItem = {
      id: nanoid(),
      name,
      type,
      parentId,
      isFile,
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));

    return newItem.id;
  },

  deleteDirectory: (id: string) => {
    const deleteRecursively = (targetId: string, allItems: DirectoryItem[]): string[] => {
      const childIds = allItems
        .filter((item) => item.parentId === targetId)
        .flatMap((child) => deleteRecursively(child.id, allItems));

      return [targetId, ...childIds];
    };

    set((state) => {
      const toDeleteIds = deleteRecursively(id, state.items);
      return {
        items: state.items.filter((item) => !toDeleteIds.includes(item.id)),
      };
    });
  },

  getDirectory: (id: string) => {
    return get().items.find((item) => item.id === id);
  },

  getChildrenOf: (parentId: string | null) => {
    return get().items.filter((item) => item.parentId === parentId);
  },
}));