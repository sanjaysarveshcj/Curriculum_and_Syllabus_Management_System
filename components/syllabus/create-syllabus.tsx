import { useState } from 'react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';
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

      // Map extracted data to FormFields structure
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
      // setCurrentStep(2); // Remove this line so it doesn't go to review
      setMethod('manual'); // Switch to manual input after extraction
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

      // Download the DOCX file directly
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
      // console.error('DOCX generation error:', err);
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
      // Only allow .txt, .docx, .pdf
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a .txt, .docx, or .pdf file');
        return;
      }
      // Create a synthetic event to reuse handleFileUpload
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(syntheticEvent);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Create Syllabus</h1>
        <p className="text-gray-600">Create and submit a new syllabus for review</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Steps Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="hover-lift rounded-lg shadow">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg p-4">
              <h2 className="text-lg font-semibold">Progress Steps</h2>
            </div>
            <div className="p-4 space-y-2">
              <div
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  currentStep === 1 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full mr-3 flex items-center justify-center text-sm font-medium ${
                    currentStep > 1
                      ? 'bg-purple-500 text-white'
                      : currentStep === 1
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className={currentStep === 1 ? 'font-medium' : ''}>Content Creation</span>
              </div>
              <div
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  currentStep === 2 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full mr-3 flex items-center justify-center text-sm font-medium ${
                    currentStep === 2 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </div>
                <span className={currentStep === 2 ? 'font-medium' : ''}>Review & Submit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9">
          <div className="rounded-lg shadow animate-slide-up">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg p-4">
              <h2 className="text-xl font-semibold">
                {currentStep === 1 ? 'Syllabus Content' : 'Review & Submit'}
              </h2>
              <p className="text-purple-100">
                {currentStep === 1
                  ? 'Fill in or review the syllabus content'
                  : 'Review the generated DOCX and submit for approval'}
              </p>
            </div>

            <div className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Creation Method */}
                  <div className="space-y-3">
                    <label className="text-base font-medium">Creation Method</label>
                    <div className="flex space-x-4">
                      <Button
                        variant={method === 'manual' ? 'default' : 'outline'}
                        onClick={() => {
                          setMethod('manual');
                          setExtractionError(null);
                          setShowManualFallback(false);
                        }}
                        className={method === 'manual' ? 'bg-purple-600 hover:bg-purple-700' : ''}
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
                        className={method === 'upload' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      >
                        Upload File
                      </Button>
                    </div>
                  </div>

                  {/* File Upload Section - only show upload UI, not fields, always */}
                  {method === 'upload' && !showManualFallback && (
                    <div
                      className={`border-2 border-dashed border-purple-200 bg-purple-50 rounded-lg transition-colors duration-150 ${dragActive ? 'border-purple-500 bg-purple-100' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="p-8 text-center">
                        <input
                          id="file-upload"
                          type="file"
                          accept=".txt,.docx,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer inline-block">
                          <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-purple-900 mb-2">Upload Syllabus File</p>
                          <p className="text-purple-700 mb-4">
                            Drag and drop or click to select .txt, .docx, or .pdf files
                          </p>
                          <span className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer inline-block">Choose File</span>
                        </label>
                        {isGenerating && (
                          <div className="flex items-center justify-center mt-4 text-purple-700">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700 mr-2"></span>
                            Analyzing document...
                          </div>
                        )}
                        {extractionError && (
                          <div className="text-sm text-red-600 mt-2">{extractionError}</div>
                        )}
                        {dragActive && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-purple-700 bg-white/80 px-6 py-3 rounded-lg border border-purple-300 shadow-lg text-lg font-semibold">Drop file here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Fields (Manual or after extraction or fallback) - only show in manual mode or fallback */}
                  {(method === 'manual' || showManualFallback) && (
                    <div className="space-y-6">
                      {showManualFallback && (
                        <div className="mt-4">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Automatic extraction failed</AlertTitle>
                            <AlertDescription>
                              Please enter the syllabus details manually below.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="title" className="text-sm font-medium">
                            Syllabus Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input"
                            placeholder="Enter syllabus title"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-medium">
                            Subject Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="form-input"
                            placeholder="E.g., CS101"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Course Objectives <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formFields.objectives}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormFields((prev) => ({ ...prev, objectives: value }));
                          }}
                          className="form-input min-h-[80px]"
                          placeholder="Enter course objectives, one per line..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Course Description</label>
                        <textarea
                          value={formFields.courseDescription}
                          onChange={(e) =>
                            setFormFields((prev) => ({
                              ...prev,
                              courseDescription: e.target.value,
                            }))
                          }
                          className="form-input min-h-[80px]"
                          placeholder="Enter course description..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prerequisites</label>
                        <textarea
                          value={formFields.prerequisites}
                          onChange={(e) =>
                            setFormFields((prev) => ({ ...prev, prerequisites: e.target.value }))
                          }
                          className="form-input min-h-[80px]"
                          placeholder="Enter prerequisites..."
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Units</h3>
                        {formFields.units.map((unit, index) => (
                          <div key={`unit-${index}`} className="space-y-2">
                            <label className="text-sm font-medium">
                              Unit {index + 1} Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={unit.name}
                              onChange={(e) => {
                                const newUnits = [...formFields.units];
                                newUnits[index] = { ...newUnits[index], name: e.target.value };
                                setFormFields((prev) => ({ ...prev, units: newUnits }));
                              }}
                              className="form-input"
                              placeholder={`Enter Unit ${index + 1} name...`}
                            />
                            <label className="text-sm font-medium">
                              Unit {index + 1} Hours <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={unit.hours}
                              onChange={(e) => {
                                const newUnits = [...formFields.units];
                                newUnits[index] = { ...newUnits[index], hours: e.target.value };
                                setFormFields((prev) => ({ ...prev, units: newUnits }));
                              }}
                              className="form-input"
                              placeholder={`Enter Unit ${index + 1} hours...`}
                            />
                            <label className="text-sm font-medium">
                              Unit {index + 1} Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={unit.content}
                              onChange={(e) => {
                                const newUnits = [...formFields.units];
                                newUnits[index] = { ...newUnits[index], content: e.target.value };
                                setFormFields((prev) => ({ ...prev, units: newUnits }));
                              }}
                              className="form-input"
                              placeholder={`Enter Unit ${index + 1} content...`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Lecture Hours (L) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={formFields.L}
                            onChange={(e) =>
                              setFormFields((prev) => ({ ...prev, L: e.target.value }))
                            }
                            className="form-input"
                            placeholder="e.g., 3"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Tutorial Hours (T) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={formFields.T}
                            onChange={(e) =>
                              setFormFields((prev) => ({ ...prev, T: e.target.value }))
                            }
                            className="form-input"
                            placeholder="e.g., 1"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Practical Hours (P) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={formFields.P}
                            onChange={(e) =>
                              setFormFields((prev) => ({ ...prev, P: e.target.value }))
                            }
                            className="form-input"
                            placeholder="e.g., 2"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Credits (C) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={formFields.C}
                            onChange={(e) =>
                              setFormFields((prev) => ({ ...prev, C: e.target.value }))
                            }
                            className="form-input"
                            placeholder="e.g., 4"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Number of Theory Periods <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formFields.theoryPeriods}
                            onChange={(e) =>
                              setFormFields((prev) => ({ ...prev, theoryPeriods: e.target.value }))
                            }
                            className="form-input"
                            placeholder="e.g., 40"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Number of Practical Periods
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
                            className="form-input"
                            placeholder="e.g., 20"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Total Number of Periods <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formFields.totalPeriods}
                            onChange={(e) =>
                              setFormFields((prev) => ({ ...prev, totalPeriods: e.target.value }))
                            }
                            className="form-input"
                            placeholder="e.g., 60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Practical Exercises</label>
                        <textarea
                          value={formFields.practicalExercises}
                          onChange={(e) =>
                            setFormFields((prev) => ({
                              ...prev,
                              practicalExercises: e.target.value,
                            }))
                          }
                          className="form-input"
                          placeholder="Enter practical exercises..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Course Format</label>
                        <textarea
                          value={formFields.courseFormat}
                          onChange={(e) =>
                            setFormFields((prev) => ({ ...prev, courseFormat: e.target.value }))
                          }
                          className="form-input"
                          placeholder="e.g., Lecture, Lab, Group Work"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Assessments & Grading</label>
                        <textarea
                          value={formFields.assessments}
                          onChange={(e) =>
                            setFormFields((prev) => ({ ...prev, assessments: e.target.value }))
                          }
                          className="form-input"
                          placeholder="Enter assessments and grading details..."
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Course Outcomes</h3>
                        {formFields.courseOutcomes.map((co, index) => (
                          <div key={index} className="space-y-2">
                            <label className="text-sm font-medium">
                              CO{index + 1} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={co}
                              onChange={(e) => {
                                const newCOs = [...formFields.courseOutcomes];
                                newCOs[index] = e.target.value;
                                setFormFields((prev) => ({ ...prev, courseOutcomes: newCOs }));
                              }}
                              className="form-input min-h-[80px]"
                              placeholder={`Enter course outcome ${index + 1}...`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Text Books <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formFields.textBooks}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormFields((prev) => ({ ...prev, textBooks: value }));
                          }}
                          className="form-input"
                          placeholder="Enter text books, one per line..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Reference Books <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formFields.references}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormFields((prev) => ({ ...prev, references: value }));
                          }}
                          className="form-input"
                          placeholder="Enter reference books, one per line..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          YouTube Resources
                        </label>
                        <textarea
                          value={formFields.ytResources}
                          onChange={(e) =>
                            setFormFields((prev) => ({ ...prev, ytResources: e.target.value }))
                          }
                          className="form-input"
                          placeholder="Enter YouTube resource links..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Web Resources
                        </label>
                        <textarea
                          value={formFields.webResources}
                          onChange={(e) =>
                            setFormFields((prev) => ({ ...prev, webResources: e.target.value }))
                          }
                          className="form-input"
                          placeholder="Enter web resource links..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          List of Softwares
                        </label>
                        <textarea
                          value={formFields.listOfSoftwares}
                          onChange={(e) =>
                            setFormFields((prev) => ({ ...prev, listOfSoftwares: e.target.value }))
                          }
                          className="form-input"
                          placeholder="Enter software list..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          E-Book
                        </label>
                        <textarea
                          value={formFields.eBook}
                          onChange={(e) =>
                            setFormFields((prev) => ({ ...prev, eBook: e.target.value }))
                          }
                          className="form-input"
                          placeholder="Enter e-book details..."
                        />
                      </div>

                      <div className="text-center pt-6">
                        <Button
                          onClick={handleGenerateDOCX}
                          className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
                          disabled={isGenerating}
                          type="button"
                        >
                          {isGenerating ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                              Generating...
                            </>
                          ) : (
                            <>
                              Generate DOCX
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Syllabus Summary - show only the four main fields */}
                  <div className="rounded-md border bg-secondary/20 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-medium">Title</label>
                        <p className="text-gray-700 mt-1">{title}</p>
                      </div>
                      <div>
                        <label className="font-medium">Subject Code</label>
                        <p className="text-gray-700 mt-1">{subject}</p>
                      </div>
                      <div>
                        <label className="font-medium">L-T-P-C Structure</label>
                        <p className="text-gray-700 mt-1">
                          {formFields.L}-{formFields.T}-{formFields.P}-{formFields.C}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium">Total Periods</label>
                        <p className="text-gray-700 mt-1">{formFields.totalPeriods}</p>
                      </div>
                    </div>
                    {/* View More Button */}
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setShowAllFields((v) => !v)}>
                        {showAllFields ? 'Hide Details' : 'View More'}
                      </Button>
                    </div>
                    {showAllFields && (
                      <div className="mt-6 space-y-6">
                        {/* Render only fields with data, using same labels as manual input */}
                        {formFields.objectives && (
                          <div>
                            <label className="font-medium block mb-1">Course Objectives</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.objectives}</div>
                          </div>
                        )}
                        {formFields.courseDescription && (
                          <div>
                            <label className="font-medium block mb-1">Course Description</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.courseDescription}</div>
                          </div>
                        )}
                        {formFields.prerequisites && (
                          <div>
                            <label className="font-medium block mb-1">Prerequisites</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.prerequisites}</div>
                          </div>
                        )}
                        {/* Units */}
                        {formFields.units.some(u => u.name || u.hours || u.content) && (
                          <div>
                            <label className="font-medium block mb-1">Units</label>
                            <div className="space-y-3">
                              {formFields.units.map((u, i) =>
                                (u.name || u.hours || u.content) ? (
                                  <div key={i} className="pl-2 border-l-2 border-purple-200 bg-gray-50 rounded px-3 py-2">
                                    {u.name && <div className="mb-1"><span className="font-semibold">Unit {i+1} Name:</span> {u.name}</div>}
                                    {u.hours && <div className="mb-1"><span className="font-semibold">Hours:</span> {u.hours}</div>}
                                    {u.content && <div><span className="font-semibold">Content:</span> <span className="whitespace-pre-line">{u.content}</span></div>}
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}
                        {formFields.practicalExercises && (
                          <div>
                            <label className="font-medium block mb-1">Practical Exercises</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.practicalExercises}</div>
                          </div>
                        )}
                        {formFields.practicalPeriods && (
                          <div>
                            <label className="font-medium block mb-1">Number of Practical Periods</label>
                            <div className="text-gray-700 bg-gray-50 rounded px-3 py-2 mb-2">{formFields.practicalPeriods}</div>
                          </div>
                        )}
                        {formFields.courseFormat && (
                          <div>
                            <label className="font-medium block mb-1">Course Format</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.courseFormat}</div>
                          </div>
                        )}
                        {formFields.assessments && (
                          <div>
                            <label className="font-medium block mb-1">Assessments & Grading</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.assessments}</div>
                          </div>
                        )}
                        {/* Course Outcomes */}
                        {formFields.courseOutcomes.some(co => co) && (
                          <div>
                            <label className="font-medium block mb-1">Course Outcomes</label>
                            <div className="space-y-2">
                              {formFields.courseOutcomes.map((co, i) =>
                                co ? (
                                  <div key={i} className="bg-gray-50 rounded px-3 py-2"><span className="font-semibold">CO{i+1}:</span> {co}</div>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}
                        {formFields.textBooks && (
                          <div>
                            <label className="font-medium block mb-1">Text Books</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.textBooks}</div>
                          </div>
                        )}
                        {formFields.references && (
                          <div>
                            <label className="font-medium block mb-1">Reference Books</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.references}</div>
                          </div>
                        )}
                        {formFields.ytResources && (
                          <div>
                            <label className="font-medium block mb-1">YouTube Resources</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.ytResources}</div>
                          </div>
                        )}
                        {formFields.webResources && (
                          <div>
                            <label className="font-medium block mb-1">Web Resources</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.webResources}</div>
                          </div>
                        )}
                        {formFields.listOfSoftwares && (
                          <div>
                            <label className="font-medium block mb-1">List of Softwares</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.listOfSoftwares}</div>
                          </div>
                        )}
                        {formFields.eBook && (
                          <div>
                            <label className="font-medium block mb-1">E-Book</label>
                            <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 mb-2">{formFields.eBook}</div>
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