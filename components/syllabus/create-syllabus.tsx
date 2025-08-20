import { useState } from 'react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { CheckCircle, Upload, AlertCircle, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { generateDocxFromTemplate } from '../../utils/DocxFromTemplate';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

// Define interfaces for type safety
interface Unit {
  name: string;
  hours: string;
  content: string;
}

interface FormFields {
  objectives: string[];
  courseDescription: string;
  prerequisites: string;
  units: Unit[];
  theoryPeriods: string;
  practicalExercises: string;
  practicalPeriods: string;
  totalPeriods: string;
  courseFormat: string;
  assessments: string;
  courseOutcomes: string[];
  textBooks: string[];
  references: string[];
  ytResources: string[];
  webResources: string[];
  listOfSoftwares: string[];
  eBook: string[];
  L: string;
  T: string;
  P: string;
  C: string;
}

const CreateSyllabus = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [method, setMethod] = useState<'manual' | 'upload'>('manual');
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    units: true,
    periods: true,
    outcomes: true,
    resources: true,
  });

  // Basic info states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');

  // Form fields state
  const [formFields, setFormFields] = useState<FormFields>({
    objectives: [''],
    courseDescription: '',
    prerequisites: '',
    units: [{ name: '', hours: '', content: '' }],
    theoryPeriods: '',
    practicalExercises: '',
    practicalPeriods: '',
    totalPeriods: '',
    courseFormat: '',
    assessments: '',
    courseOutcomes: [''],
    textBooks: [''],
    references: [''],
    ytResources: [''],
    webResources: [''],
    listOfSoftwares: [''],
    eBook: [''],
    L: '',
    T: '',
    P: '',
    C: '',
  });

  // Handle file upload and extract data
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a .txt, .docx, or .pdf file');
      return;
    }

    setIsGenerating(true);
    setExtractionError(null);
    setShowManualFallback(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/extract-syllabus', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract data');
      }

      const extractedData = await response.json();

      // Map units from extracted data to array of objects
      const units = [];
      for (let i = 1; i <= 5; i++) {
        if (extractedData[`unit${i}Name`] || extractedData[`unit${i}Hours`] || extractedData[`unit${i}Content`]) {
          units.push({
            name: extractedData[`unit${i}Name`] || '',
            hours: extractedData[`unit${i}Hours`] || '',
            content: extractedData[`unit${i}Content`] || '',
          });
        }
      }

      const courseOutcomes = extractedData.courseOutcomes?.split('\n').filter(Boolean) || [''];
      const objectives = extractedData.objectives?.split('\n').filter(Boolean) || [''];
      const textBooks = extractedData.textBooks?.split('\n').filter(Boolean) || [''];
      const references = extractedData.references?.split('\n').filter(Boolean) || [''];
      const ytResources = extractedData.ytResources?.split('\n').filter(Boolean) || [''];
      const webResources = extractedData.webResources?.split('\n').filter(Boolean) || [''];
      const listOfSoftwares = extractedData.listOfSoftwares?.split('\n').filter(Boolean) || [''];
      const eBook = extractedData.eBook?.split('\n').filter(Boolean) || [''];

      setTitle(extractedData.title || '');
      setSubject(extractedData.subject || '');
      setFormFields({
        objectives,
        courseDescription: extractedData.courseDescription || '',
        prerequisites: extractedData.prerequisites || '',
        units: units.length > 0 ? units : [{ name: '', hours: '', content: '' }],
        theoryPeriods: extractedData.theoryPeriods || '',
        practicalExercises: extractedData.practicalExercises || '',
        practicalPeriods: extractedData.practicalPeriods || '',
        totalPeriods: extractedData.totalPeriods || '',
        courseFormat: extractedData.courseFormat || '',
        assessments: extractedData.assessments || '',
        courseOutcomes,
        textBooks,
        references,
        ytResources,
        webResources,
        listOfSoftwares,
        eBook,
        L: extractedData.L || '',
        T: extractedData.T || '',
        P: extractedData.P || '',
        C: extractedData.C || '',
      });

      toast.success('Data extracted from file. Review and proceed.');
      setMethod('manual');
    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setExtractionError(`Extraction failed: ${errorMessage}`);
      toast.error('Failed to extract data. Please try manual entry.');
      setShowManualFallback(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Transform FormFields to Record<string, string>
  const transformFormFields = (fields: FormFields): Record<string, string> => {
    const result: Record<string, string> = {
      objectives: fields.objectives.join('\n'),
      courseDescription: fields.courseDescription,
      prerequisites: fields.prerequisites,
      theoryPeriods: fields.theoryPeriods,
      practicalExercises: fields.practicalExercises,
      practicalPeriods: fields.practicalPeriods,
      totalPeriods: fields.totalPeriods,
      courseFormat: fields.courseFormat,
      assessments: fields.assessments,
      courseOutcomes: fields.courseOutcomes.join('\n'),
      textBooks: fields.textBooks.join('\n'),
      references: fields.references.join('\n'),
      ytResources: fields.ytResources.join('\n'),
      webResources: fields.webResources.join('\n'),
      listOfSoftwares: fields.listOfSoftwares.join('\n'),
      eBook: fields.eBook.join('\n'),
      L: fields.L,
      T: fields.T,
      P: fields.P,
      C: fields.C,
    };

    fields.units.forEach((unit, i) => {
      result[`unit${i + 1}Name`] = unit.name;
      result[`unit${i + 1}Hours`] = unit.hours;
      result[`unit${i + 1}Content`] = unit.content;
    });

    return result;
  };

  // Validate form fields (no required fields)
  const validateFormFields = () => {
    return true; // All fields are optional
  };

  // Handle DOCX generation and download
  const handleGenerateDOCX = async () => {
    if (!validateFormFields()) {
      toast.error('Please fill all required fields.');
      return;
    }

    setIsGenerating(true);

    const data: Record<string, any> = {
      COURSE_TITLE: title,
      COURSE_CODE: subject,
      OBJECTIVES: formFields.objectives.map((obj, i) => ({
        SNO: `${i + 1}.`,
        OBJECTIVE: obj,
      })),
      COURSE_DESCRIPTION: formFields.courseDescription,
      PREREQUISITES: formFields.prerequisites,
      THEORY_PERIODS: formFields.theoryPeriods,
      PRACTICAL_EXERCISES: formFields.practicalExercises,
      PRACTICAL_PERIODS: formFields.practicalPeriods,
      TOTAL_PERIODS: formFields.totalPeriods,
      COURSE_FORMAT: formFields.courseFormat,
      ASSESSMENTS: formFields.assessments,
      TEXTBOOKS: formFields.textBooks.map((tb, i) => ({
        SNO: `${i + 1}.`,
        TEXTBOOK: tb,
      })),
      REFERENCES: formFields.references.map((ref, i) => ({
        SNO: `${i + 1}.`,
        REFERENCE: ref,
      })),
      // ✅ Conditional sections: Only include if there are items to display
      // This prevents empty headings from appearing in the document
      YT_RESOURCES: formFields.ytResources.length > 0 ? {
        items: formFields.ytResources.map((yr, i) => ({
          SNO: `${i + 1}.`,
          YT_RESOURCE: yr,
        }))
      } : null,
      WEB_RESOURCES: formFields.webResources.length > 0 ? {
        items: formFields.webResources.map((wr, i) => ({
          SNO: `${i + 1}.`,
          WEB_RESOURCE: wr,
        }))
      } : null,
      LIST_OF_SOFTWARES: formFields.listOfSoftwares.length > 0 ? {
        items: formFields.listOfSoftwares.map((ls, i) => ({
          SNO: `${i + 1}.`,
          LIST_OF_SOFTWARE: ls,
        }))
      } : null,
      E_BOOK: formFields.eBook.length > 0 ? {
        items: formFields.eBook.map((eb, i) => ({
          SNO: `${i + 1}.`,
          BOOK: eb,
        }))
      } : null,
      L: formFields.L,
      T: formFields.T,
      P: formFields.P,
      C: formFields.C,
    };

    formFields.units.forEach((unit, i) => {
      data[`UNIT${i + 1}_NAME`] = unit.name;
      data[`UNIT${i + 1}_HOURS`] = unit.hours;
      data[`UNIT${i + 1}_CONTENT`] = unit.content;
    });

    formFields.courseOutcomes.forEach((co, i) => {
      data[`CO${i + 1}`] = co;
    });

    try {
      const docxBlob = await generateDocxFromTemplate('/templates/Syllabus-Template.docx', data);
      if (!(docxBlob instanceof Blob)) {
        throw new Error('Generated DOCX is not a valid Blob');
      }

      const url = window.URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Generated_Syllabus.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('DOCX generated and downloaded');
      setCurrentStep(2);
    } catch (err) {
      toast.error('Failed to generate DOCX');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle drag and drop events for file upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a .txt, .docx, or .pdf file');
        return;
      }
      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(syntheticEvent);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Add and remove field handlers
  const addField = (field: keyof FormFields) => {
    setFormFields((prev) => {
      if (field === 'units') {
        return {
          ...prev,
          units: [...prev.units, { name: '', hours: '', content: '' }],
        };
      }
      return { ...prev, [field]: [...prev[field], ''] };
    });
  };

  const removeField = (field: keyof FormFields, fieldIndex: number, unitIndex?: number) => {
    setFormFields((prev) => {
      if (field === 'units' && unitIndex !== undefined) {
        if (prev.units.length > 1) {
          return { ...prev, units: prev.units.filter((_, i) => i !== unitIndex) };
        }
        return prev;
      }
      if (Array.isArray(prev[field])) {
        return { ...prev, [field]: (prev[field] as string[]).filter((_, i) => i !== fieldIndex) };
      }
      return prev;
    });
  };

  const updateField = (field: keyof FormFields, fieldIndex: number, value: string) => {

    setFormFields((prev) => {
      if (Array.isArray(prev[field])) {
        return { ...prev, [field]: (prev[field] as string[]).map((item, i) => (i === fieldIndex ? value : item)) };
      }
      return prev;
    });
  };

  const updateUnitField = (unitIndex: number, key: keyof Unit, value: string) => {
    setFormFields((prev) => {
      const newUnits = [...prev.units];
      newUnits[unitIndex] = { ...newUnits[unitIndex], [key]: value };
      return { ...prev, units: newUnits };
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">Create Syllabus</h1>
        <p className="text-lg text-gray-500">Easily create or upload a syllabus for review</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Steps Sidebar */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5">
              <h2 className="text-xl font-semibold">Progress</h2>
            </div>
            <div className="p-5 space-y-4">
              <div
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                  currentStep === 1 ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-semibold mr-3 ${
                    currentStep > 1
                      ? 'bg-indigo-500 text-white'
                      : currentStep === 1
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
                </div>
                <span className={currentStep === 1 ? 'font-semibold' : ''}>Content Creation</span>
              </div>
              <div
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                  currentStep === 2 ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-semibold mr-3 ${
                    currentStep === 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </div>
                <span className={currentStep === 2 ? 'font-semibold' : ''}>Review & Submit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-1 lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <h2 className="text-2xl font-semibold">
                {currentStep === 1 ? 'Syllabus Content' : 'Review & Submit'}
              </h2>
              <p className="text-indigo-100 mt-1">
                {currentStep === 1
                  ? 'Enter or upload syllabus details'
                  : 'Review your syllabus and submit for approval'}
              </p>
            </div>

            <div className="p-8">
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Creation Method */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Choose Input Method</h3>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant={method === 'manual' ? 'default' : 'outline'}
                        onClick={() => {
                          setMethod('manual');
                          setExtractionError(null);
                          setShowManualFallback(false);
                        }}
                        className={`flex-1 min-w-[120px] ${
                          method === 'manual'
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        Manual Input
                      </Button>
                      <Button
                        variant={method === 'upload' ? 'default' : 'outline'}
                        onClick={() => {
                          setMethod('upload');
                          setExtractionError(null);
                          setShowManualFallback(false);
                        }}
                        className={`flex-1 min-w-[120px] ${
                          method === 'upload'
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        Upload File
                      </Button>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  {method === 'upload' && !showManualFallback && (
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        accept=".txt,.docx,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <Upload className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">
                          Upload Syllabus File
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Drag and drop or click to upload .txt, .docx, or .pdf files
                        </p>
                        <span className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                          Choose File
                        </span>
                      </label>
                      {isGenerating && (
                        <div className="flex items-center justify-center mt-4 text-indigo-600">
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></span>
                          Processing...
                        </div>
                      )}
                      {extractionError && (
                        <p className="text-red-500 mt-4 text-sm">{extractionError}</p>
                      )}
                    </div>
                  )}

                  {/* Form Fields */}
                  {(method === 'manual' || showManualFallback) && (
                    <div className="space-y-8">
                      {showManualFallback && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <AlertTitle className="text-red-700">Extraction Failed</AlertTitle>
                          <AlertDescription className="text-red-600">
                            Please enter the syllabus details manually below.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Basic Information */}
                      <div className="border rounded-xl bg-gray-50">
                        <button
                          type="button"
                          className="w-full flex justify-between items-center p-5 text-left"
                          onClick={() => toggleSection('basicInfo')}
                        >
                          <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                          {expandedSections.basicInfo ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        {expandedSections.basicInfo && (
                          <div className="p-5 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label
                                  htmlFor="title"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Syllabus Title
                                  <span className="ml-1 text-gray-400" title="Enter the full course title">
                                    ⓘ
                                  </span>
                                </label>
                                <input
                                  id="title"
                                  type="text"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Enter syllabus title"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="subject"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Subject Code
                                  <span className="ml-1 text-gray-400" title="Enter the course code (e.g., CS101)">
                                    ⓘ
                                  </span>
                                </label>
                                <input
                                  id="subject"
                                  type="text"
                                  value={subject}
                                  onChange={(e) => setSubject(e.target.value)}
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="E.g., CS101"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Course Objectives
                              </label>
                              {formFields.objectives.map((obj, index) => (
                                <div key={`objective-${index}`} className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={obj}
                                    onChange={(e) => updateField('objectives', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`Objective ${index + 1}`}
                                  />
                                  {formFields.objectives.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('objectives', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => addField('objectives')}
                                className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Objective
                              </Button>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Course Description
                              </label>
                              <textarea
                                value={formFields.courseDescription}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    courseDescription: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter course description..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Prerequisites
                              </label>
                              <textarea
                                value={formFields.prerequisites}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    prerequisites: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter prerequisites..."
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Units */}
                      <div className="border rounded-xl bg-gray-50">
                        <button
                          type="button"
                          className="w-full flex justify-between items-center p-5 text-left"
                          onClick={() => toggleSection('units')}
                        >
                          <h3 className="text-lg font-semibold text-gray-800">Course Units</h3>
                          {expandedSections.units ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        {expandedSections.units && (
                          <div className="p-5 space-y-6">
                            {formFields.units.map((unit, unitIdx) => (
                              <div key={unitIdx} className="border rounded-lg p-4 bg-white mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-md font-semibold text-gray-800">Unit {unitIdx + 1}</h4>
                                  {formFields.units.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('units', unitIdx, unitIdx)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 mb-2">
                                  <input
                                    type="text"
                                    className="w-full md:w-1/2 rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`Unit ${unitIdx + 1} Name`}
                                    value={unit.name}
                                    onChange={(e) => updateUnitField(unitIdx, 'name', e.target.value)}
                                  />
                                  <input
                                    type="text"
                                    className="w-full md:w-1/4 rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Hours"
                                    value={unit.hours}
                                    onChange={(e) => updateUnitField(unitIdx, 'hours', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block font-medium text-gray-700 mb-1">Content</label>
                                  <textarea
                                    className="flex-1 rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 min-h-[200px] w-full resize-y text-base"
                                    placeholder="Enter unit content..."
                                    value={unit.content}
                                    onChange={(e) => updateUnitField(unitIdx, 'content', e.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => addField('units')}
                              className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Unit
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Periods and Credits */}
                      <div className="border rounded-xl bg-gray-50">
                        <button
                          type="button"
                          className="w-full flex justify-between items-center p-5 text-left"
                          onClick={() => toggleSection('periods')}
                        >
                          <h3 className="text-lg font-semibold text-gray-800">
                            Periods and Credits
                          </h3>
                          {expandedSections.periods ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        {expandedSections.periods && (
                          <div className="p-5 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Lecture (L)
                                </label>
                                <input
                                  type="number"
                                  value={formFields.L}
                                  onChange={(e) =>
                                    setFormFields((prev) => ({ ...prev, L: e.target.value }))
                                  }
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="e.g., 3"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Tutorial (T)
                                </label>
                                <input
                                  type="number"
                                  value={formFields.T}
                                  onChange={(e) =>
                                    setFormFields((prev) => ({ ...prev, T: e.target.value }))
                                  }
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="e.g., 1"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Practical (P)
                                </label>
                                <input
                                  type="number"
                                  value={formFields.P}
                                  onChange={(e) =>
                                    setFormFields((prev) => ({ ...prev, P: e.target.value }))
                                  }
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="e.g., 2"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Credits (C)
                                </label>
                                <input
                                  type="number"
                                  value={formFields.C}
                                  onChange={(e) =>
                                    setFormFields((prev) => ({ ...prev, C: e.target.value }))
                                  }
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="e.g., 4"
                                  min="0"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Theory Periods
                                </label>
                                <input
                                  type="text"
                                  value={formFields.theoryPeriods}
                                  onChange={(e) =>
                                    setFormFields((prev) => ({
                                      ...prev,
                                      theoryPeriods: e.target.value,
                                    }))
                                  }
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="e.g., 40"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Practical Periods
                                </label>
                                <input
                                  type="text"
                                  value={formFields.practicalPeriods}
                                  onChange={(e) =>
                                    setFormFields((prev) => ({
                                      ...prev,
                                      practicalPeriods: e.target.value,
                                    }))
                                  }
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="e.g., 20"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Total Periods
                                </label>
                                <input
                                  type="text"
                                  value={formFields.totalPeriods}
                                  onChange={(e) =>
                                    setFormFields((prev) => ({
                                      ...prev,
                                      totalPeriods: e.target.value,
                                    }))
                                  }
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="e.g., 60"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Practical Exercises
                              </label>
                              <textarea
                                value={formFields.practicalExercises}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    practicalExercises: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter practical exercises..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Course Format
                              </label>
                              <textarea
                                value={formFields.courseFormat}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    courseFormat: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="e.g., Lecture, Lab, Group Work"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Assessments & Grading
                              </label>
                              <textarea
                                value={formFields.assessments}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    assessments: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter assessments and grading details..."
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Course Outcomes */}
                      <div className="border rounded-xl bg-gray-50">
                        <button
                          type="button"
                          className="w-full flex justify-between items-center p-5 text-left"
                          onClick={() => toggleSection('outcomes')}
                        >
                          <h3 className="text-lg font-semibold text-gray-800">Course Outcomes</h3>
                          {expandedSections.outcomes ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        {expandedSections.outcomes && (
                          <div className="p-5 space-y-6">
                            {formFields.courseOutcomes.map((co, index) => (
                              <div key={`co-${index}`}>
                                <label className="block text-sm font-medium text-gray-700">
                                  CO{index + 1}
                                </label>
                                <div className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={co}
                                    onChange={(e) => updateField('courseOutcomes', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`Course Outcome ${index + 1}`}
                                  />
                                  {formFields.courseOutcomes.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('courseOutcomes', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => addField('courseOutcomes')}
                              className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Course Outcome
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Resources */}
                      <div className="border rounded-xl bg-gray-50">
                        <button
                          type="button"
                          className="w-full flex justify-between items-center p-5 text-left"
                          onClick={() => toggleSection('resources')}
                        >
                          <h3 className="text-lg font-semibold text-gray-800">Resources</h3>
                          {expandedSections.resources ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        {expandedSections.resources && (
                          <div className="p-5 space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Text Books
                              </label>
                              {formFields.textBooks.map((tb, index) => (
                                <div key={`textbook-${index}`} className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={tb}
                                    onChange={(e) => updateField('textBooks', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`Text Book ${index + 1}`}
                                  />
                                  {formFields.textBooks.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('textBooks', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => addField('textBooks')}
                                className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Text Book
                              </Button>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Reference Books
                              </label>
                              {formFields.references.map((ref, index) => (
                                <div key={`reference-${index}`} className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={ref}
                                    onChange={(e) => updateField('references', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`Reference ${index + 1}`}
                                  />
                                  {formFields.references.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('references', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => addField('references')}
                                className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Reference
                              </Button>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                YouTube Resources
                              </label>
                              {formFields.ytResources.map((yt, index) => (
                                <div key={`yt-resource-${index}`} className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={yt}
                                    onChange={(e) => updateField('ytResources', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`YouTube Resource ${index + 1}`}
                                  />
                                  {formFields.ytResources.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('ytResources', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => addField('ytResources')}
                                className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add YouTube Resource
                              </Button>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Web Resources
                              </label>
                              {formFields.webResources.map((web, index) => (
                                <div key={`web-resource-${index}`} className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={web}
                                    onChange={(e) => updateField('webResources', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`Web Resource ${index + 1}`}
                                  />
                                  {formFields.webResources.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('webResources', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => addField('webResources')}
                                className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Web Resource
                              </Button>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                List of Softwares
                              </label>
                              {formFields.listOfSoftwares.map((software, index) => (
                                <div key={`software-${index}`} className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={software}
                                    onChange={(e) => updateField('listOfSoftwares', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`Software ${index + 1}`}
                                  />
                                  {formFields.listOfSoftwares.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('listOfSoftwares', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => addField('listOfSoftwares')}
                                className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Software
                              </Button>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                E-Books
                              </label>
                              {formFields.eBook.map((ebook, index) => (
                                <div key={`ebook-${index}`} className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="text"
                                    value={ebook}
                                    onChange={(e) => updateField('eBook', index, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={`E-Book ${index + 1}`}
                                  />
                                  {formFields.eBook.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeField('eBook', index)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => addField('eBook')}
                                className="mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add E-Book
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTitle('');
                            setSubject('');
                            setFormFields({
                              objectives: [''],
                              courseDescription: '',
                              prerequisites: '',
                              units: [{ name: '', hours: '', content: '' }],
                              theoryPeriods: '',
                              practicalExercises: '',
                              practicalPeriods: '',
                              totalPeriods: '',
                              courseFormat: '',
                              assessments: '',
                              courseOutcomes: [''],
                              textBooks: [''],
                              references: [''],
                              ytResources: [''],
                              webResources: [''],
                              listOfSoftwares: [''],
                              eBook: [''],
                              L: '',
                              T: '',
                              P: '',
                              C: '',
                            });
                            toast.success('Form cleared');
                          }}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          Clear Form
                        </Button>
                        <Button
                          onClick={handleGenerateDOCX}
                          disabled={isGenerating}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          {isGenerating ? (
                            <>
                              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                              Generating...
                            </>
                          ) : (
                            'Generate DOCX'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review & Submit */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <h3 className="text-lg font-semibold text-gray-800">Review Your Syllabus</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">Basic Information</h4>
                      <p><strong>Title:</strong> {title}</p>
                      <p><strong>Subject Code:</strong> {subject}</p>
                      <p><strong>Objectives:</strong></p>
                      <ul className="list-disc pl-5">
                        {formFields.objectives.map((obj, index) => (
                          <li key={`review-objective-${index}`}>{obj}</li>
                        ))}
                      </ul>
                      <p><strong>Course Description:</strong> {formFields.courseDescription}</p>
                      <p><strong>Prerequisites:</strong> {formFields.prerequisites}</p>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">Course Units</h4>
                      {formFields.units.map((unit, index) => (
                        <div key={`review-unit-${index}`} className="mt-2">
                          <p><strong>Unit {index + 1}:</strong> {unit.name} ({unit.hours} hours)</p>
                          <p><strong>Content:</strong> {unit.content}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">Periods and Credits</h4>
                      <p><strong>Lecture (L):</strong> {formFields.L}</p>
                      <p><strong>Tutorial (T):</strong> {formFields.T}</p>
                      <p><strong>Practical (P):</strong> {formFields.P}</p>
                      <p><strong>Credits (C):</strong> {formFields.C}</p>
                      <p><strong>Theory Periods:</strong> {formFields.theoryPeriods}</p>
                      <p><strong>Practical Periods:</strong> {formFields.practicalPeriods}</p>
                      <p><strong>Total Periods:</strong> {formFields.totalPeriods}</p>
                      <p><strong>Practical Exercises:</strong> {formFields.practicalExercises}</p>
                      <p><strong>Course Format:</strong> {formFields.courseFormat}</p>
                      <p><strong>Assessments:</strong> {formFields.assessments}</p>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">Course Outcomes</h4>
                      <ul className="list-disc pl-5">
                        {formFields.courseOutcomes.map((co, index) => (
                          <li key={`review-co-${index}`}>CO{index + 1}: {co}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">Resources</h4>
                      <p><strong>Text Books:</strong></p>
                      <ul className="list-disc pl-5">
                        {formFields.textBooks.map((tb, index) => (
                          <li key={`review-textbook-${index}`}>{tb}</li>
                        ))}
                      </ul>
                      <p><strong>References:</strong></p>
                      <ul className="list-disc pl-5">
                        {formFields.references.map((ref, index) => (
                          <li key={`review-reference-${index}`}>{ref}</li>
                        ))}
                      </ul>
                      <p><strong>YouTube Resources:</strong></p>
                      <ul className="list-disc pl-5">
                        {formFields.ytResources.map((yt, index) => (
                          <li key={`review-yt-${index}`}>{yt}</li>
                        ))}
                      </ul>
                      <p><strong>Web Resources:</strong></p>
                      <ul className="list-disc pl-5">
                        {formFields.webResources.map((web, index) => (
                          <li key={`review-web-${index}`}>{web}</li>
                        ))}
                      </ul>
                      <p><strong>List of Softwares:</strong></p>
                      <ul className="list-disc pl-5">
                        {formFields.listOfSoftwares.map((software, index) => (
                          <li key={`review-software-${index}`}>{software}</li>
                        ))}
                      </ul>
                      <p><strong>E-Books:</strong></p>
                      <ul className="list-disc pl-5">
                        {formFields.eBook.map((ebook, index) => (
                          <li key={`review-ebook-${index}`}>{ebook}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      Back to Edit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSyllabus;