import { useState } from 'react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { CheckCircle, Upload, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { generateDocxFromTemplate } from '../../utils/DocxFromTemplate';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

// Define interfaces for type safety
interface Unit {
  name: string;
  hours: string;
  content: string;
}

interface FormFields {
  objectives: string;
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
  textBooks: string;
  references: string;
  ytResources: string;
  webResources: string;
  listOfSoftwares: string;
  eBook: string;
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
    objectives: '',
    courseDescription: '',
    prerequisites: '',
    units: Array.from({ length: 5 }, () => ({ name: '', hours: '', content: '' })),
    theoryPeriods: '',
    practicalExercises: '',
    practicalPeriods: '',
    totalPeriods: '',
    courseFormat: '',
    assessments: '',
    courseOutcomes: Array(5).fill(''),
    textBooks: '',
    references: '',
    ytResources: '',
    webResources: '',
    listOfSoftwares: '',
    eBook: '',
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

      const units = Array.from({ length: 5 }, (_, i) => ({
        name: extractedData[`unit${i + 1}Name`] || '',
        hours: extractedData[`unit${i + 1}Hours`] || '',
        content: extractedData[`unit${i + 1}Content`] || '',
      }));
      const courseOutcomes = Array.from({ length: 5 }, (_, i) => extractedData[`co${i + 1}`] || '');

      setTitle(extractedData.title || '');
      setSubject(extractedData.subject || '');
      setFormFields({
        objectives: extractedData.objectives || '',
        courseDescription: extractedData.courseDescription || '',
        prerequisites: extractedData.prerequisites || '',
        units,
        theoryPeriods: extractedData.theoryPeriods || '',
        practicalExercises: extractedData.practicalExercises || '',
        practicalPeriods: extractedData.practicalPeriods || '',
        totalPeriods: extractedData.totalPeriods || '',
        courseFormat: extractedData.courseFormat || '',
        assessments: extractedData.assessments || '',
        courseOutcomes,
        textBooks: extractedData.textBooks || '',
        references: extractedData.references || '',
        ytResources: extractedData.ytResources || '',
        webResources: extractedData.webResources || '',
        listOfSoftwares: extractedData.listOfSoftwares || '',
        eBook: extractedData.eBook || '',
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
    return {
      objectives: fields.objectives,
      courseDescription: fields.courseDescription,
      prerequisites: fields.prerequisites,
      unit1Name: fields.units[0].name,
      unit1Hours: fields.units[0].hours,
      unit1Content: fields.units[0].content,
      unit2Name: fields.units[1].name,
      unit2Hours: fields.units[1].hours,
      unit2Content: fields.units[1].content,
      unit3Name: fields.units[2].name,
      unit3Hours: fields.units[2].hours,
      unit3Content: fields.units[2].content,
      unit4Name: fields.units[3].name,
      unit4Hours: fields.units[3].hours,
      unit4Content: fields.units[3].content,
      unit5Name: fields.units[4].name,
      unit5Hours: fields.units[4].hours,
      unit5Content: fields.units[4].content,
      theoryPeriods: fields.theoryPeriods,
      practicalExercises: fields.practicalExercises,
      practicalPeriods: fields.practicalPeriods,
      totalPeriods: fields.totalPeriods,
      courseFormat: fields.courseFormat,
      assessments: fields.assessments,
      co1: fields.courseOutcomes[0],
      co2: fields.courseOutcomes[1],
      co3: fields.courseOutcomes[2],
      co4: fields.courseOutcomes[3],
      co5: fields.courseOutcomes[4],
      textBooks: fields.textBooks,
      references: fields.references,
      ytResources: fields.ytResources,
      webResources: fields.webResources,
      listOfSoftwares: fields.listOfSoftwares,
      eBook: fields.eBook,
      L: fields.L,
      T: fields.T,
      P: fields.P,
      C: fields.C,
    };
  };

  // Validate form fields
  const validateFormFields = () => {
    const requiredFields = [
      title,
      subject,
      formFields.objectives,
      formFields.theoryPeriods,
      formFields.totalPeriods,
      formFields.textBooks,
      formFields.references,
      formFields.L,
      formFields.T,
      formFields.P,
      formFields.C,
    ];
    const allStringsFilled = requiredFields.every((field) => field.trim() !== '');
    const allUnitsFilled = formFields.units.every(
      (unit) => unit.name.trim() !== '' && unit.hours.trim() !== '' && unit.content.trim() !== ''
    );
    const allCOsFilled = formFields.courseOutcomes.every((co) => co.trim() !== '');

    return allStringsFilled && allUnitsFilled && allCOsFilled;
  };

  // Handle DOCX generation and download
  const handleGenerateDOCX = async () => {
    if (!validateFormFields()) {
      toast.error('Please fill all required fields.');
      return;
    }

    setIsGenerating(true);

    const data = {
      COURSE_TITLE: title,
      COURSE_CODE: subject,
      OBJECTIVES: formFields.objectives,
      COURSE_DESCRIPTION: formFields.courseDescription,
      PREREQUISITES: formFields.prerequisites,
      UNIT1_NAME: formFields.units[0].name,
      UNIT1_HOURS: formFields.units[0].hours,
      UNIT1_CONTENT: formFields.units[0].content,
      UNIT2_NAME: formFields.units[1].name,
      UNIT2_HOURS: formFields.units[1].hours,
      UNIT2_CONTENT: formFields.units[1].content,
      UNIT3_NAME: formFields.units[2].name,
      UNIT3_HOURS: formFields.units[2].hours,
      UNIT3_CONTENT: formFields.units[2].content,
      UNIT4_NAME: formFields.units[3].name,
      UNIT4_HOURS: formFields.units[3].hours,
      UNIT4_CONTENT: formFields.units[3].content,
      UNIT5_NAME: formFields.units[4].name,
      UNIT5_HOURS: formFields.units[4].hours,
      UNIT5_CONTENT: formFields.units[4].content,
      THEORY_PERIODS: formFields.theoryPeriods,
      PRACTICAL_EXERCISES: formFields.practicalExercises,
      PRACTICAL_PERIODS: formFields.practicalPeriods,
      TOTAL_PERIODS: formFields.totalPeriods,
      COURSE_FORMAT: formFields.courseFormat,
      ASSESSMENTS: formFields.assessments,
      CO1: formFields.courseOutcomes[0],
      CO2: formFields.courseOutcomes[1],
      CO3: formFields.courseOutcomes[2],
      CO4: formFields.courseOutcomes[3],
      CO5: formFields.courseOutcomes[4],
      TEXT_BOOKS: formFields.textBooks,
      REFERENCES: formFields.references,
      YT_RESOURCES: formFields.ytResources,
      WEB_RESOURCES: formFields.webResources,
      LIST_OF_SOFTWARES: formFields.listOfSoftwares,
      E_BOOK: formFields.eBook,
      L: formFields.L,
      T: formFields.T,
      P: formFields.P,
      C: formFields.C,
    };

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
        'application/vnd.openxmlformats-officedocument.wordprocessing faculties',
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
                        dragActive
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 bg-gray-50'
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
                                  Syllabus Title <span className="text-red-500">*</span>
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
                                  Subject Code <span className="text-red-500">*</span>
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
                                Course Objectives <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={formFields.objectives}
                                onChange={(e) =>
                                  setFormFields((prev) => ({ ...prev, objectives: e.target.value }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter course objectives, one per line..."
                              />
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
                            {formFields.units.map((unit, index) => (
                              <div
                                key={`unit-${index}`}
                                className="p-4 bg-white rounded-lg shadow-sm"
                              >
                                <h4 className="text-md font-semibold text-gray-800 mb-4">
                                  Unit {index + 1}
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={unit.name}
                                      onChange={(e) => {
                                        const newUnits = [...formFields.units];
                                        newUnits[index] = {
                                          ...newUnits[index],
                                          name: e.target.value,
                                        };
                                        setFormFields((prev) => ({ ...prev, units: newUnits }));
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                      placeholder={`Unit ${index + 1} name`}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Hours <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={unit.hours}
                                      onChange={(e) => {
                                        const newUnits = [...formFields.units];
                                        newUnits[index] = {
                                          ...newUnits[index],
                                          hours: e.target.value,
                                        };
                                        setFormFields((prev) => ({ ...prev, units: newUnits }));
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                      placeholder={`Unit ${index + 1} hours`}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                      value={unit.content}
                                      onChange={(e) => {
                                        const newUnits = [...formFields.units];
                                        newUnits[index] = {
                                          ...newUnits[index],
                                          content: e.target.value,
                                        };
                                        setFormFields((prev) => ({ ...prev, units: newUnits }));
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                      placeholder={`Unit ${index + 1} content`}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
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
                                  Lecture (L) <span className="text-red-500">*</span>
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
                                  Tutorial (T) <span className="text-red-500">*</span>
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
                                  Practical (P) <span className="text-red-500">*</span>
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
                                  Credits (C) <span className="text-red-500">*</span>
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
                                  Theory Periods <span className="text-red-500">*</span>
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
                                  Total Periods <span className="text-red-500">*</span>
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
                              <div key={index}>
                                <label className="block text-sm font-medium text-gray-700">
                                  CO{index + 1} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  value={co}
                                  onChange={(e) => {
                                    const newCOs = [...formFields.courseOutcomes];
                                    newCOs[index] = e.target.value;
                                    setFormFields((prev) => ({ ...prev, courseOutcomes: newCOs }));
                                  }}
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                  placeholder={`Enter course outcome ${index + 1}...`}
                                />
                              </div>
                            ))}
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
                                Text Books <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={formFields.textBooks}
                                onChange={(e) =>
                                  setFormFields((prev) => ({ ...prev, textBooks: e.target.value }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter text books, one per line..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Reference Books <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={formFields.references}
                                onChange={(e) =>
                                  setFormFields((prev) => ({ ...prev, references: e.target.value }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter reference books, one per line..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                YouTube Resources
                              </label>
                              <textarea
                                value={formFields.ytResources}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    ytResources: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter YouTube resource links..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Web Resources
                              </label>
                              <textarea
                                value={formFields.webResources}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    webResources: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter web resource links..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                List of Softwares
                              </label>
                              <textarea
                                value={formFields.listOfSoftwares}
                                onChange={(e) =>
                                  setFormFields((prev) => ({
                                    ...prev,
                                    listOfSoftwares: e.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter software list..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                E-Book
                              </label>
                              <textarea
                                value={formFields.eBook}
                                onChange={(e) =>
                                  setFormFields((prev) => ({ ...prev, eBook: e.target.value }))
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Enter e-book details..."
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="text-center pt-8">
                        <Button
                          onClick={handleGenerateDOCX}
                          className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg text-white font-semibold"
                          disabled={isGenerating}
                          type="button"
                        >
                          {isGenerating ? (
                            <>
                              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                              Generating...
                            </>
                          ) : (
                            'Generate Syllabus'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="rounded-xl border bg-gray-50 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Syllabus Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-medium text-gray-700">Title</label>
                        <p className="text-gray-600 mt-1">{title}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Subject Code</label>
                        <p className="text-gray-600 mt-1">{subject}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">L-T-P-C Structure</label>
                        <p className="text-gray-600 mt-1">
                          {formFields.L}-{formFields.T}-{formFields.P}-{formFields.C}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Total Periods</label>
                        <p className="text-gray-600 mt-1">{formFields.totalPeriods}</p>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllFields((v) => !v)}
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        {showAllFields ? 'Hide Details' : 'View All Details'}
                      </Button>
                    </div>
                    {showAllFields && (
                      <div className="mt-8 space-y-6">
                        {formFields.objectives && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Course Objectives
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.objectives}
                            </div>
                          </div>
                        )}
                        {formFields.courseDescription && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Course Description
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.courseDescription}
                            </div>
                          </div>
                        )}
                        {formFields.prerequisites && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Prerequisites
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.prerequisites}
                            </div>
                          </div>
                        )}
                        {formFields.units.some((u) => u.name || u.hours || u.content) && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">Units</label>
                            <div className="space-y-4">
                              {formFields.units.map((u, i) =>
                                u.name || u.hours || u.content ? (
                                  <div
                                    key={i}
                                    className="bg-white rounded-lg p-4 shadow-sm"
                                  >
                                    {u.name && (
                                      <div className="mb-2">
                                        <span className="font-semibold">Unit {i + 1} Name:</span>{' '}
                                        {u.name}
                                      </div>
                                    )}
                                    {u.hours && (
                                      <div className="mb-2">
                                        <span className="font-semibold">Hours:</span> {u.hours}
                                      </div>
                                    )}
                                    {u.content && (
                                      <div>
                                        <span className="font-semibold">Content:</span>{' '}
                                        <span className="whitespace-pre-line">{u.content}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}
                        {formFields.practicalExercises && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Practical Exercises
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.practicalExercises}
                            </div>
                          </div>
                        )}
                        {formFields.practicalPeriods && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Number of Practical Periods
                            </label>
                            <div className="text-gray-600 bg-white rounded-lg p-4 shadow-sm">
                              {formFields.practicalPeriods}
                            </div>
                          </div>
                        )}
                        {formFields.courseFormat && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Course Format
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.courseFormat}
                            </div>
                          </div>
                        )}
                        {formFields.assessments && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Assessments & Grading
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.assessments}
                            </div>
                          </div>
                        )}
                        {formFields.courseOutcomes.some((co) => co) && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Course Outcomes
                            </label>
                            <div className="space-y-4">
                              {formFields.courseOutcomes.map((co, i) =>
                                co ? (
                                  <div
                                    key={i}
                                    className="bg-white rounded-lg p-4 shadow-sm"
                                  >
                                    <span className="font-semibold">CO{i + 1}:</span> {co}
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}
                        {formFields.textBooks && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Text Books
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.textBooks}
                            </div>
                          </div>
                        )}
                        {formFields.references && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Reference Books
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.references}
                            </div>
                          </div>
                        )}
                        {formFields.ytResources && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              YouTube Resources
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.ytResources}
                            </div>
                          </div>
                        )}
                        {formFields.webResources && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              Web Resources
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.webResources}
                            </div>
                          </div>
                        )}
                        {formFields.listOfSoftwares && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              List of Softwares
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.listOfSoftwares}
                            </div>
                          </div>
                        )}
                        {formFields.eBook && (
                          <div>
                            <label className="font-medium text-gray-700 block mb-1">
                              E-Book
                            </label>
                            <div className="text-gray-600 whitespace-pre-line bg-white rounded-lg p-4 shadow-sm">
                              {formFields.eBook}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

