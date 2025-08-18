import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { generateDocxFromTemplate } from '../../utils/DocxFromTemplate';
import { DocxMerger } from '@spfxappdev/docxmerger';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  HeightRule,
} from 'docx';
import { saveAs } from 'file-saver';

// Interfaces for type safety
interface Course {
  sno: string;
  courseTitle: string;
  semester: string;
  syllabusUrl?: string;
  syllabusFile?: File;
  l: string;
  t: string;
  p: string;
  c: string;
}

interface SemesterCourse {
  sno: string;
  type: string;
  courseCode: string;
  courseTitle: string;
  syllabusUrl?: string;
  syllabusFile?: File;
  l: string;
  t: string;
  p: string;
  c: string;
}

interface ElectiveCell {
  courseCode: string;
  courseTitle: string;
  syllabusUrl?: string;
  syllabusFile?: File;
}

interface ElectiveColumn {
  verticalNumber: string;
  verticalName: string;
  cells: ElectiveCell[];
}

interface OpenElectiveTable {
  name: string;
  courses: Course[];
}

interface MandatoryCourseTable {
  name: string;
  courses: Course[];
}

interface FormFields {
  degree: string;
  branchName: string;
  regulation: string;
  updateHistory: { versionNo: string; date: string; authorName: string; updates: string }[];
  hsmc: string;
  bsc: string;
  esc: string;
  pcc: string;
  pec: string;
  oec: string;
  eec: string;
  mc: string;
  hsmcCourses: Course[];
  bscCourses: Course[];
  escCourses: Course[];
  pccCourses: Course[];
  pecCourses: Course[];
  oecCourses: Course[];
  eecCourses: Course[];
  mcCourses: Course[];
  semester1Courses: SemesterCourse[];
  semester2Courses: SemesterCourse[];
  semester3Courses: SemesterCourse[];
  semester4Courses: SemesterCourse[];
  semester5Courses: SemesterCourse[];
  semester6Courses: SemesterCourse[];
  semester7Courses: SemesterCourse[];
  semester8Courses: SemesterCourse[];
  professionalElectives: ElectiveColumn[];
  openElectiveTables: OpenElectiveTable[];
  mandatoryCourseTables: MandatoryCourseTable[];
}

const CATEGORIES = [
  { key: 'hsmc', label: 'Humanities & Social Science (HSMC)' },
  { key: 'bsc', label: 'Basic Science (BSC)' },
  { key: 'esc', label: 'Engineering Science (ESC)' },
  { key: 'pcc', label: 'Program Core (PCC)' },
  { key: 'pec', label: 'Professional Elective (PEC)' },
  { key: 'oec', label: 'Open Elective (OEC)' },
  { key: 'eec', label: 'Employability Enhancement (EEC)' },
  { key: 'mc', label: 'Mandatory Courses (MC)' },
] as const;

const SEMESTERS = [
  { key: 'semester1', label: 'Semester I' },
  { key: 'semester2', label: 'Semester II' },
  { key: 'semester3', label: 'Semester III' },
  { key: 'semester4', label: 'Semester IV' },
  { key: 'semester5', label: 'Semester V' },
  { key: 'semester6', label: 'Semester VI' },
  { key: 'semester7', label: 'Semester VII' },
  { key: 'semester8', label: 'Semester VIII' },
] as const;

// Helper to convert number to Roman numeral
const toRoman = (num: number): string => {
  const romanMap: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'],
    [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'],
    [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, symbol] of romanMap) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

// Helper to escape XML special characters
const sanitize = (text: string) =>
  text.replace(/[&<>]/g, (c) => ({ '&': '&', '<': '<', '>': '>' }[c] || c));

// Component for rendering a single course input row
const CourseInputRow: React.FC<{
  category: string;
  index: number;
  course: Course | SemesterCourse;
  isSemester: boolean;
  isElective?: boolean;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  allSubjects: { _id: string; title: string; code: string; syllabusUrl?: string }[];
  isFirstInSection?: boolean;
  headerTitle?: string;
}> = ({ allSubjects, category, index, course, isSemester, isElective = false, onChange, onRemove, canRemove, isFirstInSection = false, headerTitle = '' }) => {
 const handleSubjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedId = e.target.value;
  const selectedSubject = allSubjects.find((subj) => subj._id === selectedId);
  if (selectedSubject) {
    onChange(index, 'courseCode', selectedSubject.code);
    onChange(index, 'courseTitle', selectedSubject.title);
    if (selectedSubject.syllabusUrl) {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        const syllabusUrl = `${baseUrl}/api/auth/file/${selectedSubject.syllabusUrl}`;
        const response = await fetch(syllabusUrl);
        if (!response.ok) throw new Error(`Failed to fetch syllabus file: ${response.statusText}`);
        const blob = await response.blob();
        const extension = blob.type === 'application/pdf' ? 'pdf' : 'docx';
        const fileName = `${selectedSubject.title}.${extension}`;
        let file: File | undefined = undefined;

        if (isFirstInSection && headerTitle && extension === 'docx') {
          const mergeRes = await fetch(`http://localhost:5001/merge-first-syllabus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: headerTitle,
              syllabusUrl: syllabusUrl,
            }),
          });
          if (!mergeRes.ok) throw new Error('Failed to merge header and syllabus');
          const mergedBlob = await mergeRes.blob();
          file = new File([mergedBlob], `merged-${fileName}`, { type: mergedBlob.type });
        } else {
          file = new File([blob], fileName, { type: blob.type });
        }

        onChange(index, 'syllabusFile', file);
        onChange(index, 'syllabusUrl', selectedSubject.syllabusUrl);
      } catch (error) {
        console.error('Error fetching syllabus file:', error);
        toast.error('Failed to load syllabus file');
      }
    } else {
      onChange(index, 'syllabusFile', undefined);
      onChange(index, 'syllabusUrl', '');
    }
  }
};
  return (
    <div className="flex flex-wrap items-center gap-2 py-2 bg-purple-50 rounded-lg p-3 dark:bg-gray-800">
      <input
        type="text"
        value={course.sno}
        onChange={(e) => onChange(index, 'sno', e.target.value)}
        className="w-12 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center text-sm"
        placeholder="S.No."
      />
      {isSemester && (
        <>
          <select
            value={(course as SemesterCourse).type}
            onChange={(e) => onChange(index, 'type', e.target.value)}
            className="w-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="">Type</option>
            <option value="Theory">Theory</option>
            <option value="Practical">Practical</option>
            <option value="T&P">T&P</option>
          </select>
          <input
            type="text"
            value={(course as SemesterCourse).courseCode}
            onChange={(e) => onChange(index, 'courseCode', e.target.value)}
            className="w-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Code"
          />
        </>
      )}
      <input
        type="text"
        value={course.courseTitle}
        onChange={(e) => onChange(index, 'courseTitle', e.target.value)}
        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
        placeholder="Course Title"
      />
      {(isSemester || isElective) && (
        <select
          value={(course as SemesterCourse).syllabusUrl || ''}
          onChange={handleSubjectChange}
          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Subject</option>
          {allSubjects.map((subj) => (
            <option key={subj._id} value={subj._id}>
              {subj.code} - {subj.title}
            </option>
          ))}
        </select>
      )}
      {(course as SemesterCourse).syllabusUrl && (
        <p className="text-xs text-green-600 font-medium mt-1">Syllabus File Selected</p>
      )}
      {!isSemester && !isElective && (
        <input
          type="text"
          value={(course as Course).semester}
          onChange={(e) => onChange(index, 'semester', e.target.value)}
          className="w-12 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center text-sm"
          placeholder="Sem"
        />
      )}
      <input
        type="text"
        value={course.l}
        onChange={(e) => onChange(index, 'l', e.target.value)}
        className="w-12 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center text-sm"
        placeholder="L"
      />
      <input
        type="text"
        value={course.t}
        onChange={(e) => onChange(index, 't', e.target.value)}
        className="w-12 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center text-sm"
        placeholder="T"
      />
      <input
        type="text"
        value={course.p}
        onChange={(e) => onChange(index, 'p', e.target.value)}
        className="w-12 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center text-sm"
        placeholder="P"
      />
      <input
        type="text"
        value={course.c}
        onChange={(e) => onChange(index, 'c', e.target.value)}
        className="w-12 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center text-sm"
        placeholder="C"
      />
      {canRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="w-8 h-8 p-0 flex items-center justify-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const CreateCurriculum: React.FC = () => {
  const [allSubjects, setAllSubjects] = useState<{ _id: string; title: string; code: string; syllabusUrl?: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [manualUploadFile, setManualUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courseCounts, setCourseCounts] = useState({
    hsmc: 1,
    bsc: 1,
    esc: 1,
    pcc: 1,
    pec: 1,
    oec: 1,
    eec: 1,
    mc: 1,
    semester1: 1,
    semester2: 1,
    semester3: 1,
    semester4: 1,
    semester5: 1,
    semester6: 1,
    semester7: 1,
    semester8: 1,
    openElective1: 1,
    openElective2: 1,
    mandatoryCourse1: 1,
    mandatoryCourse2: 1,
  });

  const [formFields, setFormFields] = useState<FormFields>({
    degree: '',
    branchName: '',
    regulation: '',
    updateHistory: [{ versionNo: '', date: '', authorName: '', updates: '' }],
    hsmc: '',
    bsc: '',
    esc: '',
    pcc: '',
    pec: '',
    oec: '',
    eec: '',
    mc: '',
    hsmcCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    bscCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    escCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    pccCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    pecCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    oecCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    eecCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    mcCourses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester1Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester2Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester3Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester4Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester5Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester6Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester7Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    semester8Courses: [{ sno: '1', type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }],
    professionalElectives: [
      {
        verticalNumber: 'Vertical I',
        verticalName: '',
        cells: [{ courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined }],
      },
    ],
    openElectiveTables: [
      { name: 'Open Electives - I', courses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }] },
      { name: 'Open Electives - II', courses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }] },
    ],
    mandatoryCourseTables: [
      { name: 'Mandatory Course - I', courses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }] },
      { name: 'Mandatory Course - II', courses: [{ sno: '1', courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }] },
    ],
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auth/subjects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setAllSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  const handleCourseCountChange = (key: keyof typeof courseCounts, value: number) => {
    if (value < 1) return;
    setCourseCounts((prev) => ({ ...prev, [key]: value }));

    setFormFields((prev) => {
      const fieldKey = key.startsWith('semester') ? `${key}Courses` : 
                      key.startsWith('openElective') ? 'openElectiveTables' :
                      key.startsWith('mandatoryCourse') ? 'mandatoryCourseTables' :
                      `${key}Courses`;
      if (key.startsWith('openElective') || key.startsWith('mandatoryCourse')) {
        const tableIndex = key === 'openElective1' ? 0 : key === 'openElective2' ? 1 : key === 'mandatoryCourse1' ? 0 : 1;
        const tables = [...(prev[fieldKey as keyof FormFields] as (OpenElectiveTable | MandatoryCourseTable)[])];
        const newCourses = Array.from({ length: value }, (_, i) =>
          tables[tableIndex].courses[i] || { sno: String(i + 1), courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }
        );
        tables[tableIndex] = { ...tables[tableIndex], courses: newCourses };
        return { ...prev, [fieldKey]: tables };
      } else {
        const currentCourses = prev[fieldKey as keyof FormFields] as (Course | SemesterCourse)[];
        const newCourses = Array.from({ length: value }, (_, i) =>
          currentCourses[i] ||
          (key.startsWith('semester')
            ? { sno: String(i + 1), type: '', courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' }
            : { sno: String(i + 1), courseTitle: '', semester: '', syllabusUrl: '', syllabusFile: undefined, l: '', t: '', p: '', c: '' })
        );
        return { ...prev, [fieldKey]: newCourses };
      }
    });
  };

  const handleCourseChange = (
    key: keyof typeof courseCounts,
    index: number,
    field: keyof Course | keyof SemesterCourse,
    value: any
  ) => {
    setFormFields((prev) => {
      const fieldKey = key.startsWith('semester') ? `${key}Courses` : 
                      key.startsWith('openElective') ? 'openElectiveTables' :
                      key.startsWith('mandatoryCourse') ? 'mandatoryCourseTables' :
                      `${key}Courses`;
      if (key.startsWith('openElective') || key.startsWith('mandatoryCourse')) {
        const tableIndex = key === 'openElective1' ? 0 : key === 'openElective2' ? 1 : key === 'mandatoryCourse1' ? 0 : 1;
        const tables = [...(prev[fieldKey as keyof FormFields] as (OpenElectiveTable | MandatoryCourseTable)[])];
        const courses = [...tables[tableIndex].courses];
        courses[index] = { ...courses[index], [field]: value };
        tables[tableIndex] = { ...tables[tableIndex], courses };
        return { ...prev, [fieldKey]: tables };
      } else {
        const courses = [...(prev[fieldKey as keyof FormFields] as (Course | SemesterCourse)[])];
        courses[index] = { ...courses[index], [field]: value };
        return { ...prev, [fieldKey]: courses };
      }
    });
  };

  const handleRemoveCourse = (key: keyof typeof courseCounts, index: number) => {
    setFormFields((prev) => {
      const fieldKey = key.startsWith('semester') ? `${key}Courses` : 
                      key.startsWith('openElective') ? 'openElectiveTables' :
                      key.startsWith('mandatoryCourse') ? 'mandatoryCourseTables' :
                      `${key}Courses`;
      if (key.startsWith('openElective') || key.startsWith('mandatoryCourse')) {
        const tableIndex = key === 'openElective1' ? 0 : key === 'openElective2' ? 1 : key === 'mandatoryCourse1' ? 0 : 1;
        const tables = [...(prev[fieldKey as keyof FormFields] as (OpenElectiveTable | MandatoryCourseTable)[])];
        const newCourses = [...tables[tableIndex].courses];
        newCourses.splice(index, 1);
        newCourses.forEach((c, i) => (c.sno = String(i + 1)));
        tables[tableIndex] = { ...tables[tableIndex], courses: newCourses };
        return { ...prev, [fieldKey]: tables };
      } else {
        const newCourses = [...(prev[fieldKey as keyof FormFields] as (Course | SemesterCourse)[])];
        newCourses.splice(index, 1);
        newCourses.forEach((c, i) => (c.sno = String(i + 1)));
        return { ...prev, [fieldKey]: newCourses };
      }
    });
    setCourseCounts((prev) => ({ ...prev, [key]: prev[key] - 1 }));
  };

  const handleElectiveVerticalNameChange = (index: number, name: string) => {
    setFormFields((prev) => {
      const updated = [...prev.professionalElectives];
      updated[index].verticalName = name;
      return { ...prev, professionalElectives: updated };
    });
  };

  const handleElectiveCellChange = async (
    columnIndex: number,
    rowIndex: number,
    field: 'courseCode' | 'courseTitle' | 'syllabusUrl' | 'syllabusFile',
    value: any
  ) => {
    if (field === 'syllabusUrl' && value) {
      const selectedSubject = allSubjects.find((subj) => subj._id === value);
      if (selectedSubject) {
        try {
          const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
          const syllabusUrl = `${baseUrl}/api/auth/file/${selectedSubject.syllabusUrl}`;
          const response = await fetch(syllabusUrl);
          if (!response.ok) throw new Error(`Failed to fetch syllabus file: ${response.statusText}`);
          const blob = await response.blob();
          const extension = blob.type === 'application/pdf' ? 'pdf' : 'docx';
          const fileName = `${selectedSubject.title}.${extension}`;
          let file: File | undefined = undefined;

          // Merge header for the first row in each vertical
          if (rowIndex === 0 && extension === 'docx') {
            const verticalNumber = formFields.professionalElectives[columnIndex].verticalNumber;
            const verticalName = formFields.professionalElectives[columnIndex].verticalName;
            const headerTitle = verticalName ? `${verticalNumber} - ${verticalName}` : verticalNumber;
            const mergeRes = await fetch(`http://localhost:5001/merge-first-syllabus`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: headerTitle,
                syllabusUrl: syllabusUrl,
              }),
            });
            if (!mergeRes.ok) throw new Error('Failed to merge header and syllabus');
            const mergedBlob = await mergeRes.blob();
            file = new File([mergedBlob], `merged-${fileName}`, { type: mergedBlob.type });
          } else {
            file = new File([blob], fileName, { type: blob.type });
          }

          setFormFields((prev) => {
            const updated = [...prev.professionalElectives];
            updated[columnIndex].cells[rowIndex] = {
              ...updated[columnIndex].cells[rowIndex],
              courseCode: selectedSubject.code,
              courseTitle: selectedSubject.title,
              syllabusUrl: selectedSubject.syllabusUrl,
              syllabusFile: file,
            };
            return { ...prev, professionalElectives: updated };
          });
        } catch (error) {
          console.error('Error fetching syllabus file:', error);
          toast.error('Failed to load syllabus file');
        }
      }
    } else {
      setFormFields((prev) => {
        const updated = [...prev.professionalElectives];
        updated[columnIndex].cells[rowIndex] = { ...updated[columnIndex].cells[rowIndex], [field]: value };
        return { ...prev, professionalElectives: updated };
      });
    }
  };

  const addElectiveColumn = () => {
    setFormFields((prev) => ({
      ...prev,
      professionalElectives: [
        ...prev.professionalElectives,
        {
          verticalNumber: `Vertical ${toRoman(prev.professionalElectives.length + 1)}`,
          verticalName: '',
          cells: Array(prev.professionalElectives[0].cells.length).fill({ courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined }),
        },
      ],
    }));
  };

  const removeElectiveColumn = (index: number) => {
    setFormFields((prev) => {
      const updated = [...prev.professionalElectives];
      updated.splice(index, 1);
      updated.forEach((col, i) => {
        col.verticalNumber = `Vertical ${toRoman(i + 1)}`;
      });
      return { ...prev, professionalElectives: updated };
    });
  };

  const addRowToElectiveColumn = () => {
    setFormFields((prev) => {
      const updated = prev.professionalElectives.map((col) => ({
        ...col,
        cells: [...col.cells, { courseCode: '', courseTitle: '', syllabusUrl: '', syllabusFile: undefined }],
      }));
      return { ...prev, professionalElectives: updated };
    });
  };

  const removeRowFromElectiveColumn = () => {
    setFormFields((prev) => {
      if (prev.professionalElectives[0].cells.length <= 1) return prev;
      const updated = prev.professionalElectives.map((col) => ({
        ...col,
        cells: col.cells.slice(0, -1),
      }));
      return { ...prev, professionalElectives: updated };
    });
  };

  const calculateTotalCredits = (courses: (Course | SemesterCourse)[]): number => {
    return courses.reduce((sum, course) => sum + (parseFloat(course.c) || 0), 0);
  };

  const transformFormFields = (fields: FormFields): Record<string, any> => {
  const transformed: Record<string, any> = {
    DEGREE: fields.degree || ' ',
    BRANCH: fields.branchName || ' ',
    REGULATION: fields.regulation || ' ',
    UPDATES_TABLE: fields.updateHistory.map((row) => ({
      VERSION_NO: row.versionNo || ' ',
      DATE: row.date || ' ',
      AUTHOR_NAME: row.authorName || ' ',
      UPDATES: row.updates || ' ',
    })),
  };

  CATEGORIES.forEach(({ key }) => {
    const courses = fields[`${key}Courses` as keyof FormFields] as Course[];
    const totalCredits = String(calculateTotalCredits(courses));
    transformed[key.toUpperCase()] = totalCredits; // Assign HSMC_TOT to HSMC, etc.
    transformed[`${key}Courses`] = courses.map((c) => ({
      SNO: c.sno || ' ',
      COURSE_TITLE: c.courseTitle || ' ',
      SEM: c.semester || ' ',
      L: c.l || '0',
      T: c.t || '0',
      P: c.p || '0',
      C: c.c || '0',
    }));
    transformed[`${key.toUpperCase()}_TOT`] = totalCredits; // Retain _TOT for consistency
  });

  transformed.TOTAL = String(
    ['hsmc', 'bsc', 'esc', 'pcc', 'pec', 'oec', 'eec', 'mc'].reduce(
      (sum, key) => sum + calculateTotalCredits(fields[`${key}Courses` as keyof FormFields] as Course[]),
      0
    )
  );

  SEMESTERS.forEach(({ key }, index) => {
    transformed[`${key}Courses`] = (fields[`${key}Courses` as keyof FormFields] as SemesterCourse[]).map((c) => ({
      SNO: c.sno || ' ',
      TYPE: c.type || ' ',
      COURSE_CODE: c.courseCode || ' ',
      COURSE_TITLE: c.courseTitle || ' ',
      L: c.l || '0',
      T: c.t || '0',
      P: c.p || '0',
      C: c.c || '0',
    }));
    transformed[`TOTAL_CREDITS${index + 1}`] = String(
      calculateTotalCredits(fields[`${key}Courses` as keyof FormFields] as SemesterCourse[])
    );
  });

  transformed['PROFESSIONAL_ELECTIVES'] = fields.professionalElectives.map((col) => ({
    VERTICAL_NUMBER: col.verticalNumber || ' ',
    VERTICAL_NAME: col.verticalName || ' ',
    CELLS: col.cells.map((cell) => ({
      COURSE_CODE: cell.courseCode || ' ',
      COURSE_TITLE: cell.courseTitle || ' ',
    })),
  }));

  fields.openElectiveTables.forEach((table, index) => {
    transformed[`OPEN_ELECTIVE_${index + 1}`] = table.courses.map((c) => ({
      SNO: c.sno || ' ',
      COURSE_TITLE: c.courseTitle || ' ',
      SEM: c.semester || ' ',
      L: c.l || '0',
      T: c.t || '0',
      P: c.p || '0',
      C: c.c || '0',
    }));
    transformed[`OPEN_ELECTIVE_${index + 1}_TOT`] = String(calculateTotalCredits(table.courses));
  });

  fields.mandatoryCourseTables.forEach((table, index) => {
    transformed[`MANDATORY_COURSE_${index + 1}`] = table.courses.map((c) => ({
      SNO: c.sno || ' ',
      COURSE_TITLE: c.courseTitle || ' ',
      SEM: c.semester || ' ',
      L: c.l || '0',
      T: c.t || '0',
      P: c.p || '0',
      C: c.c || '0',
    }));
    transformed[`MANDATORY_COURSE_${index + 1}_TOT`] = String(calculateTotalCredits(table.courses));
  });

  return transformed;
};

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const data = transformFormFields(formFields);
      let docxBlob = await generateDocxFromTemplate('/templates/Curriculum-Template.docx', data);
      const buffer1 = await docxBlob.arrayBuffer();
   

      const electives = formFields.professionalElectives;
      const columnWidth = 2460;
      const maxRows = Math.max(...electives.map(col => col.cells.length));

      const headerRow = new TableRow({
        height: { value: 0, rule: HeightRule.AUTO },
        children: electives.map(col =>
          new TableCell({
            width: { size: columnWidth, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: col.verticalNumber,
                    bold: true,
                    font: 'Cambria',
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: col.verticalName,
                    bold: true,
                    font: 'Cambria',
                    size: 22,
                  }),
                ],
              }),
            ],
          })
        ),
      });

      const dataRows = Array.from({ length: maxRows }, (_, i) =>
        new TableRow({
          height: { value: 0, rule: HeightRule.AUTO },
          children: electives.map(col => {
            const c = col.cells[i] || { courseCode: '', courseTitle: '' };
            return new TableCell({
              width: { size: columnWidth, type: WidthType.DXA },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: c.courseCode,
                      bold: true,
                      font: 'Cambria',
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: c.courseTitle,
                      font: 'Cambria',
                      size: 22,
                    }),
                  ],
                }),
              ],
            });
          }),
        })
      );

      const electivesTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      });

      const headingA = new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'APPENDIX A: PROFESSIONAL ELECTIVE COURSES VERTICALS',
            bold: true,
            font: 'Cambria',
            size: 22,
          }),
        ],
      });

      const noteA = new Paragraph({
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text:
              '*Students are permitted to choose all the Professional Electives from a particular vertical or from different verticals. However, Students are restricted to select from not more than 2 verticals.',
            font: 'Cambria',
            size: 22,
          }),
        ],
      });

      const openElectiveTables = formFields.openElectiveTables.map((table, index) => {
        const rows = table.courses.map(c =>
          new TableRow({
            height: { value: 0, rule: HeightRule.AUTO },
            children: [
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.sno, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 4320, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.courseTitle, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.semester, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.l, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.t, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.p, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.c, font: 'Cambria', size: 22 })] })],
              }),
            ],
          })
        );
        const header = new TableRow({
          height: { value: 0, rule: HeightRule.AUTO },
          children: [
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'S.No.', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 4320, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Course Title', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Semester', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'L', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'T', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'P', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'C', bold: true, font: 'Cambria', size: 22 })] })] }),
          ],
        });
        const totalRow = new TableRow({
          height: { value: 0, rule: HeightRule.AUTO },
          children: [
            new TableCell({
              width: { size: 5040, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: 'Total Credits', bold: true, font: 'Cambria', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 720, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: String(calculateTotalCredits(table.courses)), font: 'Cambria', size: 22 })] })],
            }),
          ],
        });
        return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [header, ...rows, totalRow],
        });
      });

      const mandatoryCourseTables = formFields.mandatoryCourseTables.map((table, index) => {
        const rows = table.courses.map(c =>
          new TableRow({
            height: { value: 0, rule: HeightRule.AUTO },
            children: [
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.sno, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 4320, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.courseTitle, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.semester, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.l, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.t, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.p, font: 'Cambria', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 720, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: c.c, font: 'Cambria', size: 22 })] })],
              }),
            ],
          })
        );
        const header = new TableRow({
          height: { value: 0, rule: HeightRule.AUTO },
          children: [
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'S.No.', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 4320, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Course Title', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Semester', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'L', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'T', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'P', bold: true, font: 'Cambria', size: 22 })] })] }),
            new TableCell({ width: { size: 720, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'C', bold: true, font: 'Cambria', size: 22 })] })] }),
          ],
        });
        const totalRow = new TableRow({
          height: { value: 0, rule: HeightRule.AUTO },
          children: [
            new TableCell({
              width: { size: 5040, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: 'Total Credits', bold: true, font: 'Cambria', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 720, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: String(calculateTotalCredits(table.courses)), font: 'Cambria', size: 22 })] })],
            }),
          ],
        });
        return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [header, ...rows, totalRow],
        });
      });

      const electivesDoc = new Document({
        sections: [{
          
          children: [
            headingA,
            electivesTable,
            noteA,
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'APPENDIX B: OPEN ELECTIVES',
                  bold: true,
                  font: 'Cambria',
                  size: 22,
                }),
              ],
            }),
            ...openElectiveTables.map((table, index) => [
              new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `${formFields.openElectiveTables[index].name}`, bold: true, font: 'Cambria', size: 22 })], spacing: { before: 400 } }),
              table,
              new Paragraph({ spacing: { before: 400 } }),
            ]).flat(),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'APPENDIX C: MANDATORY COURSES',
                  bold: true,
                  font: 'Cambria',
                  size: 22,
                }),
              ],
            }),
            ...mandatoryCourseTables.map((table, index) => [
              new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `${formFields.mandatoryCourseTables[index].name}`, bold: true, font: 'Cambria', size: 22 })], spacing: { before: 400 } }),
              table,
              new Paragraph({ spacing: { before: 400 } }),
            ]).flat(),
          ],
        }],
      });

      const electivesBlob = await Packer.toBlob(electivesDoc);
      const buffer2 = await electivesBlob.arrayBuffer();

      const allSemesterCourses = [
        ...formFields.semester1Courses,
        ...formFields.semester2Courses,
        ...formFields.semester3Courses,
        ...formFields.semester4Courses,
        ...formFields.semester5Courses,
        ...formFields.semester6Courses,
        ...formFields.semester7Courses,
        ...formFields.semester8Courses,
      ];

      const allElectiveCourses = formFields.professionalElectives.flatMap(col => col.cells);
      const allOpenElectiveCourses = formFields.openElectiveTables.flatMap(table => table.courses);
      const allMandatoryCourses = formFields.mandatoryCourseTables.flatMap(table => table.courses);

      const syllabusFiles = [
        ...allSemesterCourses.map(course => course.syllabusFile),
        ...allElectiveCourses.map(cell => cell.syllabusFile),
        ...allOpenElectiveCourses.map(course => course.syllabusFile),
        ...allMandatoryCourses.map(course => course.syllabusFile),
      ].filter((file): file is File => !!file);

      const syllabusBuffers: ArrayBuffer[] = await Promise.all(
        syllabusFiles
          .filter(file => file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
          .map(file => file.arrayBuffer())
      );

      if (syllabusFiles.length > 0 && syllabusBuffers.length === 0) {
        toast.error('No DOCX syllabus files found. Only DOCX files can be merged. PDFs were skipped.');
      }

      const merger = new DocxMerger();
      await merger.merge([buffer1, buffer2, ...syllabusBuffers]);
      const finalBuffer = await merger.save();

      const finalBlob = new Blob([finalBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      saveAs(finalBlob, 'Full_Curriculum.docx');
      toast.success('✔️ Full Curriculum downloaded successfully');
    } catch (error) {
      console.error('Error generating curriculum:', error);
      toast.error('❌ Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualUpload = async () => {
    if (!manualUploadFile) return toast.error("📂 Select a DOCX file first");
    if (!formFields.regulation.trim() || !formFields.branchName.trim()) {
      toast.error("Please fill in both Regulation and Department before uploading.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", manualUploadFile, "Curriculum.docx");

      const uploadRes = await fetch("http://localhost:5000/api/auth/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { fileId } = await uploadRes.json();

      const linkRes = await fetch("http://localhost:5000/api/auth/upload-curriculum", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regulationCode: formFields.regulation,
          department: formFields.branchName,
          fileId,
        }),
      });

      if (!linkRes.ok) {
        const errData = await linkRes.json();
        throw new Error(errData.error || "Failed to link file");
      }

      toast.success("✅ File uploaded and sent to superuser");
      setManualUploadFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error(`❌ ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderCourseInputs = (category: typeof CATEGORIES[number]['key'], categoryLabel: string) => {
    const courses = formFields[`${category}Courses` as keyof FormFields] as Course[];
    const totalCredits = calculateTotalCredits(courses);
    return (
      <div className="space-y-4">
        <div className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-md">
            <h3 className="text-lg font-semibold">{categoryLabel}</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Courses</label>
              <input
                type="number"
                min="1"
                value={courseCounts[category]}
                onChange={(e) => handleCourseCountChange(category, parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 font-medium text-gray-700 dark:text-gray-500 text-sm">
                <span className="w-12 text-center">S.No.</span>
                <span className="flex-1">Course Title</span>
                <span className="w-12 text-center">Sem</span>
                <span className="w-12 text-center">L</span>
                <span className="w-12 text-center">T</span>
                <span className="w-12 text-center">P</span>
                <span className="w-12 text-center">C</span>
                <span className="w-8"></span>
              </div>
              {courses.map((course, index) => (
                <CourseInputRow
                  key={course.sno ? `${category}-${course.sno}` : `${category}-${index}`}
                  category={category}
                  index={index}
                  course={course}
                  isSemester={false}
                  onChange={(i, field, value) => handleCourseChange(category, i, field as keyof Course, value)}
                  onRemove={() => handleRemoveCourse(category, index)}
                  canRemove={courses.length > 1}
                  allSubjects={allSubjects}
                  isFirstInSection={index === 0}
                  headerTitle={category.toUpperCase()}
                />
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Credits</label>
              <input
                type="text"
                value={totalCredits.toFixed(1)}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSemesterCourseInputs = (semester: typeof SEMESTERS[number]['key'], semesterLabel: string) => {
    const courses = formFields[`${semester}Courses` as keyof FormFields] as SemesterCourse[];
    const totalCredits = calculateTotalCredits(courses);
    return (
      <div className="space-y-4">
        <div className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-md">
            <h3 className="text-lg font-semibold">{semesterLabel}</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Courses</label>
              <input
                type="number"
                min="1"
                value={courseCounts[semester]}
                onChange={(e) => handleCourseCountChange(semester, parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                <span className="w-12 text-center">S.No.</span>
                <span className="w-24 text-center">Type</span>
                <span className="w-24 text-center">Code</span>
                <span className="flex-1">Course Title</span>
                <span className="w-40 text-center">Subject</span>
                <span className="w-12 text-center">L</span>
                <span className="w-12 text-center">T</span>
                <span className="w-12 text-center">P</span>
                <span className="w-12 text-center">C</span>
                <span className="w-8"></span>
              </div>
              {courses.map((course, index) => (
                <CourseInputRow
                  key={course.sno ? `${semester}-${course.sno}` : `${semester}-${index}`}
                  category={semester}
                  index={index}
                  course={course}
                  isSemester={true}
                  onChange={(i, field, value) => handleCourseChange(semester, i, field as keyof SemesterCourse, value)}
                  onRemove={() => handleRemoveCourse(semester, index)}
                  canRemove={courses.length > 1}
                  allSubjects={allSubjects}
                  isFirstInSection={index === 0}
                  headerTitle={`Semester ${toRoman(Number(semester.replace('semester', '')) || 1)}`}
                />
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Credits</label>
              <input
                type="text"
                value={totalCredits.toFixed(1)}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfessionalElectives = () => (
    <div className="space-y-6">
      <div className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-md">
          <h3 className="text-lg font-semibold">Professional Electives</h3>
        </div>
        <div className="p-6">
          <div className="flex overflow-auto space-x-6">
            {formFields.professionalElectives.map((col, colIndex) => (
              <div key={colIndex} className="min-w-[250px] bg-white shadow-md p-4 rounded-md border border-purple-200 dark:bg-gray-800 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={col.verticalNumber}
                      readOnly
                      className="w-full p-2 border rounded-md text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      value={col.verticalName}
                      onChange={(e) => handleElectiveVerticalNameChange(colIndex, e.target.value)}
                      className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="Vertical Name"
                    />
                  </div>
                  <button
                    className="ml-2 p-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800"
                    onClick={() => removeElectiveColumn(colIndex)}
                  >
                    Remove Vertical
                  </button>
                </div>
                {col.cells.map((cell, rowIndex) => (
                  <div key={rowIndex} className="mb-3 space-y-1">
                    <input
                      type="text"
                      value={cell.courseCode}
                      onChange={(e) => handleElectiveCellChange(colIndex, rowIndex, 'courseCode', e.target.value)}
                      placeholder="Course Code"
                      className="w-full p-1 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      value={cell.courseTitle}
                      onChange={(e) => handleElectiveCellChange(colIndex, rowIndex, 'courseTitle', e.target.value)}
                      placeholder="Course Title"
                      className="w-full p-1 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <select
                      value={cell.syllabusUrl || ''}
                      onChange={(e) => handleElectiveCellChange(colIndex, rowIndex, 'syllabusUrl', e.target.value)}
                      className="w-full p-1 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Subject</option>
                      {allSubjects.map((subj) => (
                        <option key={subj._id} value={subj._id}>
                          {subj.code} - {subj.title}
                        </option>
                      ))}
                    </select>
                    {cell.syllabusUrl && (
                      <p className="text-xs text-green-600 font-medium mt-1">Syllabus File Selected</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <button
              onClick={addElectiveColumn}
              className="min-w-[150px] h-[60px] p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md dark:hover:bg-green-800 self-start"
            >
              + Add Column
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={addRowToElectiveColumn}
              className="w-full mt-2 p-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-md dark:hover:bg-purple-700"
            >
              + Add Row to All Columns
            </button>
            {formFields.professionalElectives[0].cells.length > 1 && (
              <button
                onClick={removeRowFromElectiveColumn}
                className="w-full mt-2 p-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800"
              >
                - Remove Last Row
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOpenElectiveInputs = () => (
    <div className="space-y-6">
      {formFields.openElectiveTables.map((table, index) => {
        const key = index === 0 ? 'openElective1' : 'openElective2';
        const totalCredits = calculateTotalCredits(table.courses);

        return (
          <div key={index} className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-md">
              <h3 className="text-lg font-semibold">{table.name}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Courses</label>
                <input
                  type="number"
                  min="1"
                  value={courseCounts[key]}
                  onChange={(e) => handleCourseCountChange(key, parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                  <span className="w-12 text-center">S.No.</span>
                  <span className="flex-1">Course Title</span>
                  <span className="w-40 text-center">Subject</span>
                  <span className="w-12 text-center">Sem</span>
                  <span className="w-12 text-center">L</span>
                  <span className="w-12 text-center">T</span>
                  <span className="w-12 text-center">P</span>
                  <span className="w-12 text-center">C</span>
                  <span className="w-8"></span>
                </div>
                {table.courses.map((course, courseIndex) => (
                  <CourseInputRow
                    key={courseIndex}
                    category={key}
                    index={courseIndex}
                    course={course}
                    isSemester={false}
                    isElective={true}
                    onChange={(i, field, value) => handleCourseChange(key, i, field as keyof Course, value)}
                    onRemove={() => handleRemoveCourse(key, courseIndex)}
                    canRemove={table.courses.length > 1}
                    allSubjects={allSubjects}
                    isFirstInSection={courseIndex === 0}
                    headerTitle={table.name}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Credits</label>
                <input
                  type="text"
                  value={totalCredits.toFixed(1)}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMandatoryCourseInputs = () => (
    <div className="space-y-6">
      {formFields.mandatoryCourseTables.map((table, index) => {
        const key = index === 0 ? 'mandatoryCourse1' : 'mandatoryCourse2';
        const totalCredits = calculateTotalCredits(table.courses);

        return (
          <div key={index} className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-md">
              <h3 className="text-lg font-semibold">{table.name}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Courses</label>
                <input
                  type="number"
                  min="1"
                  value={courseCounts[key]}
                  onChange={(e) => handleCourseCountChange(key, parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                  <span className="w-12 text-center">S.No.</span>
                  <span className="flex-1">Course Title</span>
                  <span className="w-40 text-center">Subject</span>
                  <span className="w-12 text-center">Sem</span>
                  <span className="w-12 text-center">L</span>
                  <span className="w-12 text-center">T</span>
                  <span className="w-12 text-center">P</span>
                  <span className="w-12 text-center">C</span>
                  <span className="w-8"></span>
                </div>
                {table.courses.map((course, courseIndex) => (
                  <CourseInputRow
                    key={courseIndex}
                    category={key}
                    index={courseIndex}
                    course={course}
                    isSemester={false}
                    isElective={true}
                    onChange={(i, field, value) => handleCourseChange(key, i, field as keyof Course, value)}
                    onRemove={() => handleRemoveCourse(key, courseIndex)}
                    canRemove={table.courses.length > 1}
                    allSubjects={allSubjects}
                    isFirstInSection={courseIndex === 0}
                    headerTitle={table.name}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Credits</label>
                <input
                  type="text"
                  value={totalCredits.toFixed(1)}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        );
      })}
      <div className="text-center mt-6">
        <Button
          onClick={handleGeneratePDF}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Curriculum DOCX'}
        </Button>
      </div>
      <div className="p-6 border rounded-md bg-white dark:bg-gray-800 shadow-sm">
        <h2 className="text-xl font-semibold text-purple-600">Send Curriculum to Superuser</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Regulation</label>
            <input
              type="text"
              value={formFields.regulation}
              onChange={(e) => setFormFields((prev) => ({ ...prev, regulation: e.target.value }))}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="E.g., R26"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
            <input
              type="text"
              value={formFields.branchName}
              onChange={(e) => setFormFields((prev) => ({ ...prev, branchName: e.target.value }))}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="E.g., CSE"
            />
          </div>
        </div>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setManualUploadFile(e.target.files?.[0] || null)}
          className="w-full p-2 mt-4 border rounded-md dark:bg-gray-800 dark:text-white"
        />
        <Button
          onClick={handleManualUpload}
          disabled={!manualUploadFile || isUploading}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isUploading ? "Uploading..." : "Send Curriculum DOCX"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-white dark:bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Create Curriculum</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">Enter curriculum details to generate documents</p>
      </motion.div>
      <div className="w-full max-w-4xl mt-6">
        <div className="flex justify-center space-x-4 border-b dark:border-gray-700">
          {[
            {label: 'Basic Info', section: 'basic' },
            { label: 'Courses', section: 'courses' },
            { label: 'Semesters', section: 'semesters' },
            { label: 'Electives', section: 'electives' },
            { label: 'Open Electives', section: 'openElectives' },
            { label: 'Mandatory Courses', section: 'mandatoryCourses' },
          ].map(({ label, section }) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`py-2 px-4 text-sm font-medium ${
                activeSection === section
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
           {activeSection === 'basic' && (
              <div className="space-y-4">
                <div className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-md">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Degree</label>
                      <input
                        type="text"
                        value={formFields.degree}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, degree: e.target.value }))}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="E.g., B.E."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                      <input
                        type="text"
                        value={formFields.branchName}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, branchName: e.target.value }))}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="E.g., Computer Science and Engineering"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Regulation</label>
                      <input
                        type="text"
                        value={formFields.regulation}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, regulation: e.target.value }))}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="E.g., 2022"
                      />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Update History</h3>
                      <div className="flex items-center space-x-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        <span className="w-1/4 text-center">Version Number</span>
                        <span className="w-1/4 text-center">Date</span>
                        <span className="w-14 text-center">Author Name</span>
                        <span className="w-1/2 text-center">Updates</span>
                        <span className="w-8"></span>
                      </div>
                      {formFields.updateHistory.map((row, index) => (
                        <div key={`update-history-${index}`} className="flex items-center space-x-2 py-2">
                          <input
                            type="text"
                            value={row.versionNo}
                            onChange={(e) =>
                              setFormFields((prev) => {
                                const updated = [...prev.updateHistory];
                                updated[index].versionNo = e.target.value;
                                return { ...prev, updateHistory: updated };
                              })
                            }
                            className="w-1/4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="e.g., 1.0"
                          />
                          <input
                            type="text"
                            value={row.date}
                            onChange={(e) =>
                              setFormFields((prev) => {
                                const updated = [...prev.updateHistory];
                                updated[index].date = e.target.value;
                                return { ...prev, updateHistory: updated };
                              })
                            }
                            className="w-1/4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="e.g., 2023-01-01"
                          />
                          <input
                            type="text"
                            value={row.authorName}
                            onChange={(e) =>
                              setFormFields((prev) => {
                                const updated = [...prev.updateHistory];
                                updated[index].authorName = e.target.value;
                                return { ...prev, updateHistory: updated };
                              })
                            }
                            className="w-1/4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="e.g., John Doe"
                          />
                          <Textarea
                            value={row.updates}
                            onChange={(e) =>
                              setFormFields((prev) => {
                                const updated = [...prev.updateHistory];
                                updated[index].updates = e.target.value;
                                return { ...prev, updateHistory: updated };
                              })
                            }
                            className="w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="e.g., Initial version"
                          />
                          {formFields.updateHistory.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setFormFields((prev) => ({
                                  ...prev,
                                  updateHistory: prev.updateHistory.filter((_, i) => i !== index),
                                }))
                              }
                              className="w-8 h-8 p-0 flex items-center justify-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        onClick={() =>
                          setFormFields((prev) => ({
                            ...prev,
                            updateHistory: [...prev.updateHistory, { versionNo: '', date: '', authorName: '', updates: '' }],
                          }))
                        }
                        className="mt-2 bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        + Add Update
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            
            
          {activeSection === 'courses' && (
            <div className="space-y-6">
              {CATEGORIES.map(({ key, label }) => renderCourseInputs(key, label))}
            </div>
          )}
          {activeSection === 'semesters' && (
            <div className="space-y-6">
              {SEMESTERS.map(({ key, label }) => renderSemesterCourseInputs(key, label))}
            </div>
          )}
          {activeSection === 'electives' && renderProfessionalElectives()}
          {activeSection === 'openElectives' && renderOpenElectiveInputs()}
          {activeSection === 'mandatoryCourses' && renderMandatoryCourseInputs()}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCurriculum;