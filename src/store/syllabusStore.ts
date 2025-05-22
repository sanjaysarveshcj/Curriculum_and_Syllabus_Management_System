import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { generateId, Status } from '../lib/utils';

export interface SyllabusForm {
  id: string;
  title: string;
  subject: string;
  department: string;
  regulation: string;
  semester: string;
  faculty: string;
  facultyId: string;
  content: Record<string, string>; // Form field values
  templatePath?: string;
  generatedPdfPath?: string;
  status: Status;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  rejectedBy?: string;
}

interface SyllabusState {
  forms: SyllabusForm[];
  createForm: (form: Omit<SyllabusForm, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => string;
  updateForm: (id: string, updates: Partial<SyllabusForm>) => boolean;
  updateStatus: (id: string, status: Status, reviewerId: string, comments?: string) => boolean;
  getFormById: (id: string) => SyllabusForm | undefined;
  getFormsByFaculty: (facultyId: string) => SyllabusForm[];
  getFormsByDepartment: (department: string) => SyllabusForm[];
  getFormsByStatus: (status: Status) => SyllabusForm[];
}

// Mock syllabus data
const mockSyllabusData: SyllabusForm[] = [
  {
    id: '1',
    title: 'Data Structures and Algorithms',
    subject: 'CS101',
    department: 'Computer Science',
    regulation: '2022',
    semester: '3',
    faculty: 'Faculty User',
    facultyId: '3',
    content: {
      courseObjectives: 'Understand fundamental data structures and algorithms',
      learningOutcomes: 'Implement and analyze algorithms for various problems',
      unitI: 'Arrays, Linked Lists, Stacks, Queues',
      unitII: 'Trees, Binary Trees, Binary Search Trees',
      unitIII: 'Graphs, Graph Traversals, Shortest Path Algorithms',
      unitIV: 'Sorting Algorithms, Searching Algorithms',
      unitV: 'Advanced Topics: Dynamic Programming, Greedy Algorithms',
      textBooks: 'Introduction to Algorithms by Cormen et al.',
      referenceBooks: 'Algorithms by Robert Sedgewick',
    },
    templatePath: '/templates/cs101_template.pdf',
    generatedPdfPath: '/generated/cs101_syllabus.pdf',
    status: 'pending',
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-10'),
  },
  {
    id: '2',
    title: 'Database Management Systems',
    subject: 'CS202',
    department: 'Computer Science',
    regulation: '2022',
    semester: '4',
    faculty: 'Faculty User',
    facultyId: '3',
    content: {
      courseObjectives: 'Learn database concepts and design principles',
      learningOutcomes: 'Design and implement database systems',
      unitI: 'Introduction to DBMS, ER Model',
      unitII: 'Relational Model, SQL',
      unitIII: 'Normalization, Transaction Processing',
      unitIV: 'Concurrency Control, Recovery',
      unitV: 'Advanced Topics: NoSQL, Distributed Databases',
      textBooks: 'Database System Concepts by Silberschatz et al.',
      referenceBooks: 'Fundamentals of Database Systems by Elmasri and Navathe',
    },
    templatePath: '/templates/cs202_template.pdf',
    generatedPdfPath: '/generated/cs202_syllabus.pdf',
    status: 'approved',
    comments: 'Excellent syllabus design',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-20'),
    approvedBy: '2',
  },
  {
    id: '3',
    title: 'Computer Networks',
    subject: 'CS303',
    department: 'Computer Science',
    regulation: '2022',
    semester: '5',
    faculty: 'Faculty User',
    facultyId: '3',
    content: {
      courseObjectives: 'Understand network architectures and protocols',
      learningOutcomes: 'Design and implement network applications',
      unitI: 'Introduction to Computer Networks, OSI Model',
      unitII: 'Physical Layer, Data Link Layer',
      unitIII: 'Network Layer, Routing Algorithms',
      unitIV: 'Transport Layer, TCP/UDP',
      unitV: 'Application Layer Protocols, Network Security',
      textBooks: 'Computer Networking: A Top-Down Approach by Kurose and Ross',
      referenceBooks: 'Data Communications and Networking by Forouzan',
    },
    templatePath: '/templates/cs303_template.pdf',
    generatedPdfPath: '/generated/cs303_syllabus.pdf',
    status: 'rejected',
    comments: 'Needs more emphasis on practical applications',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-05'),
    rejectedBy: '2',
  },
];

export const useSyllabusStore = create<SyllabusState>()(
  devtools(
    persist(
      (set, get) => ({
        forms: mockSyllabusData,
        
        createForm: (form) => {
          const id = generateId();
          const now = new Date();
          
          set((state) => ({
            forms: [
              ...state.forms,
              {
                ...form,
                id,
                status: 'pending',
                createdAt: now,
                updatedAt: now,
              },
            ],
          }));
          
          return id;
        },
        
        updateForm: (id, updates) => {
          let updated = false;
          
          set((state) => {
            const formIndex = state.forms.findIndex((form) => form.id === id);
            
            if (formIndex === -1) return state;
            
            const updatedForms = [...state.forms];
            updatedForms[formIndex] = {
              ...updatedForms[formIndex],
              ...updates,
              updatedAt: new Date(),
            };
            
            updated = true;
            return { forms: updatedForms };
          });
          
          return updated;
        },
        
        updateStatus: (id, status, reviewerId, comments) => {
          let updated = false;
          
          set((state) => {
            const formIndex = state.forms.findIndex((form) => form.id === id);
            
            if (formIndex === -1) return state;
            
            const updatedForms = [...state.forms];
            updatedForms[formIndex] = {
              ...updatedForms[formIndex],
              status,
              comments,
              updatedAt: new Date(),
              ...(status === 'approved' ? { approvedBy: reviewerId } : {}),
              ...(status === 'rejected' ? { rejectedBy: reviewerId } : {}),
            };
            
            updated = true;
            return { forms: updatedForms };
          });
          
          return updated;
        },
        
        getFormById: (id) => {
          return get().forms.find((form) => form.id === id);
        },
        
        getFormsByFaculty: (facultyId) => {
          return get().forms.filter((form) => form.facultyId === facultyId);
        },
        
        getFormsByDepartment: (department) => {
          return get().forms.filter((form) => form.department === department);
        },
        
        getFormsByStatus: (status) => {
          return get().forms.filter((form) => form.status === status);
        },
      }),
      {
        name: 'syllabus-storage',
      }
    )
  )
);