import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSyllabusStore } from '../../store/syllabusStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { generateDocxFromTemplate } from '../../utils/generateDocxFromTemplate.ts';

const CreateSyllabus = () => {
  const { createForm } = useSyllabusStore();
  const { getCurrentUser } = useAuthStore();
  const currentUser = getCurrentUser();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [regulation, setRegulation] = useState('');
  const [semester, setSemester] = useState('');

  type FormFields = {
  [key: string]: string;
};

  const [formFields, setFormFields] = useState<FormFields>({
    objectives: '',
    courseDescription: '',
    prerequisites: '',
    unit1Name: '',
    unit1Hours: '',
    unit1Content: '',
    unit2Name: '',
    unit2Hours: '',
    unit2Content: '',
    unit3Name: '',
    unit3Hours: '',
    unit3Content: '',
    unit4Name: '',
    unit4Hours: '',
    unit4Content: '',
    unit5Name: '',
    unit5Hours: '',
    unit5Content: '',
    theoryPeriods: '',
    practicalExercises: '',
    practicalPeriods: '',
    totalPeriods: '',
    courseFormat: '',
    assessments: '',
    co1: '',
    co2: '',
    co3: '',
    co4: '',
    co5: '',
    textBooks: '',
    references: '',
    ytResources: '',
  });


  const handleGeneratePDF = async () => {
    const allFieldsFilled = Object.values(formFields).every(f => f.trim() !== '');
    if (!title || !subject || !regulation || !semester || !allFieldsFilled) {
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
      UNIT1_NAME: formFields.unit1Name,
      UNIT1_HOURS: formFields.unit1Hours,
      UNIT1_CONTENT: formFields.unit1Content,
      UNIT2_NAME: formFields.unit2Name,
      UNIT2_HOURS: formFields.unit2Hours,
      UNIT2_CONTENT: formFields.unit2Content,
      UNIT3_NAME: formFields.unit3Name,
      UNIT3_HOURS: formFields.unit3Hours,
      UNIT3_CONTENT: formFields.unit3Content,
      UNIT4_NAME: formFields.unit4Name,
      UNIT4_HOURS: formFields.unit4Hours,
      UNIT4_CONTENT: formFields.unit4Content,
      UNIT5_NAME: formFields.unit5Name,
      UNIT5_HOURS: formFields.unit5Hours,
      UNIT5_CONTENT: formFields.unit5Content,
      THEORY_PERIODS: formFields.theoryPeriods,
      PRACTICAL_EXERCISES: formFields.practicalExercises,
      PRACTICAL_PERIODS: formFields.practicalPeriods,
      TOTAL_PERIODS: formFields.totalPeriods,
      COURSE_FORMAT: formFields.courseFormat,
      ASSESMENTS: formFields.assessments,
      CO1: formFields.co1,
      CO2: formFields.co2,
      CO3: formFields.co3,
      CO4: formFields.co4,
      CO5: formFields.co5,
      TEXT_BOOKS: formFields.textBooks,
      REFERENCES: formFields.references,
      YT_RESOURCES: formFields.ytResources
    };

    try {
      await generateDocxFromTemplate('/templates/Syllabus-Template.docx', data);
      toast.success('Syllabus generated and downloaded');
      setCurrentStep(4);
    } catch (err) {
      console.error("Syllabus generation error:", err);
      toast.error('Failed to generate syllabus');
    } finally {
      setIsGenerating(false);
    }
  };


  
  const handleFieldChange = (field: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    if (currentStep === 2) {
      // Validate basic info
      if (!title || !subject || !regulation || !semester) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  
  const handleSubmitSyllabus = () => {
    if (!currentUser) {
      toast.error('User session expired. Please log in again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create syllabus form
      createForm({
        title,
        subject,
        department: currentUser.department || 'Unknown',
        regulation,
        semester,
        faculty: currentUser.name,
        facultyId: currentUser.id,
        content: formFields,
        templatePath: '/templates/Syllabus-Template.docx', // Simulated path
        generatedPdfPath: '/generated/generated_syllabus.pdf', // Simulated path
      });
      
      toast.success('Syllabus submitted successfully');
      
      // Reset form
      setTitle('');
      setSubject('');
      setRegulation('');
      setSemester('');
      setFormFields({
        objectives: '',
        courseDescription: '',
        prerequisites: '',
        unit1Name: '',
        unit1Hours: '',
        unit1Content: '',
        unit2Name: '',
        unit2Hours: '',
        unit2Content: '',
        unit3Name: '',
        unit3Hours: '',
        unit3Content: '',
        unit4Name: '',
        unit4Hours: '',
        unit4Content: '',
        unit5Name: '',
        unit5Hours: '',
        unit5Content: '',
        theoryPeriods: '',
        practicalExercises: '',
        practicalPeriods: '',
        totalPeriods: '',
        courseFormat: '',
        assessments: '',
        co1: '',
        co2: '',
        co3: '',
        co4: '',
        co5: '',
        textBooks: '',
        references: '',
        ytResources: '',
      });
      setCurrentStep(1);
    } catch (error) {
      toast.error('Failed to submit syllabus');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Create Syllabus</h1>
        <p className="text-muted-foreground">Create and submit a new syllabus</p>
      </motion.div>
      
      <motion.div
        className="grid grid-cols-12 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Steps navigation */}
        <div className="col-span-12 lg:col-span-3">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title text-lg">Steps</h2>
            </div>
            <div className="card-content p-4 space-y-2">
            
              
              <div 
                className={`flex items-center p-2 rounded-md ${
                  currentStep === 1 ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <div 
                  className={`h-6 w-6 rounded-full mr-3 flex items-center justify-center text-xs ${
                    currentStep > 1 
                      ? 'bg-success text-success-foreground' 
                      : currentStep === 1 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className={currentStep === 1 ? 'font-medium' : ''}>Basic Info</span>
              </div>
              
              <div 
                className={`flex items-center p-2 rounded-md ${
                  currentStep === 2 ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <div 
                  className={`h-6 w-6 rounded-full mr-3 flex items-center justify-center text-xs ${
                    currentStep > 2 
                      ? 'bg-success text-success-foreground' 
                      : currentStep === 2 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {currentStep > 3 ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className={currentStep === 2 ? 'font-medium' : ''}>Content</span>
              </div>
              
              <div 
                className={`flex items-center p-2 rounded-md ${
                  currentStep === 3 ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <div 
                  className={`h-6 w-6 rounded-full mr-3 flex items-center justify-center text-xs ${
                    currentStep === 3 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  3
                </div>
                <span className={currentStep === 3 ? 'font-medium' : ''}>Review & Submit</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-span-12 lg:col-span-9">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title text-xl">
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Syllabus Content'}
                {currentStep === 3 && 'Review & Submit'}
              </h2>
              <p className="card-description">
                {currentStep === 1 && 'Enter the basic details of the syllabus'}
                {currentStep === 2 && 'Fill in the syllabus content'}
                {currentStep === 3 && 'Review the generated PDF and submit for approval'}
              </p>
            </div>
            
            <div className="card-content">
        
              
              {/* Step 2: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Syllabus Title
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
                      Subject Code
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="regulation" className="text-sm font-medium">
                        Regulation
                      </label>
                      <select
                        id="regulation"
                        value={regulation}
                        onChange={(e) => setRegulation(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select Regulation</option>
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="semester" className="text-sm font-medium">
                        Semester
                      </label>
                      <select
                        id="semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Course Details */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Course Objectives</label>
                      <textarea
                        value={formFields.objectives}
                        onChange={(e) => handleFieldChange('objectives', e.target.value)}
                        className="form-input min-h-[80px]"
                        placeholder="Enter course objectives..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Course Description</label>
                      <textarea
                        value={formFields.courseDescription}
                        onChange={(e) => handleFieldChange('courseDescription', e.target.value)}
                        className="form-input min-h-[80px]"
                        placeholder="Enter course description..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prerequisites</label>
                      <textarea
                        value={formFields.prerequisites}
                        onChange={(e) => handleFieldChange('prerequisites', e.target.value)}
                        className="form-input min-h-[80px]"
                        placeholder="Enter prerequisites..."
                      />
                    </div>

                    {/* Units */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium">Units</h3>

                      {[1, 2, 3, 4, 5].map((unit) => (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" key={unit}>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Unit {unit} Name</label>
                            <input
                              type="text"
                              value={formFields[`unit${unit}Name`]}
                              onChange={(e) => handleFieldChange(`unit${unit}Name`, e.target.value)}
                              className="form-input"
                              placeholder={`Enter Unit ${unit} name...`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Unit {unit} Hours</label>
                            <input
                              type="text"
                              value={formFields[`unit${unit}Hours`]}
                              onChange={(e) => handleFieldChange(`unit${unit}Hours`, e.target.value)}
                              className="form-input"
                              placeholder={`Enter Unit ${unit} hours...`}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-3">
                            <label className="text-sm font-medium">Unit {unit} Content</label>
                            <textarea
                              value={formFields[`unit${unit}Content`]}
                              onChange={(e) => handleFieldChange(`unit${unit}Content`, e.target.value)}
                              className="form-input"
                              placeholder={`Enter Unit ${unit} content...`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Periods & Exercises */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Theory Periods</label>
                        <input
                          type="text"
                          value={formFields.theoryPeriods}
                          onChange={(e) => handleFieldChange('theoryPeriods', e.target.value)}
                          className="form-input"
                          placeholder="e.g., 40"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Practical Periods</label>
                        <input
                          type="text"
                          value={formFields.practicalPeriods}
                          onChange={(e) => handleFieldChange('practicalPeriods', e.target.value)}
                          className="form-input"
                          placeholder="e.g., 20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Total Number of Periods</label>
                        <input
                          type="text"
                          value={formFields.totalPeriods}
                          onChange={(e) => handleFieldChange('totalPeriods', e.target.value)}
                          className="form-input"
                          placeholder="e.g., 60"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Practical Exercises</label>
                      <textarea
                        value={formFields.practicalExercises}
                        onChange={(e) => handleFieldChange('practicalExercises', e.target.value)}
                        className="form-input"
                        placeholder="Enter practical exercises..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Course Format</label>
                      <textarea
                        value={formFields.courseFormat}
                        onChange={(e) => handleFieldChange('courseFormat', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Lecture, Lab, Group Work"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assessments & Grading</label>
                      <textarea
                        value={formFields.assessments}
                        onChange={(e) => handleFieldChange('assessments', e.target.value)}
                        className="form-input"
                        placeholder="Enter assessments and grading details..."
                      />
                    </div>

                    {/* Course Outcomes */}
                    <h3 className="text-md font-medium">Course Outcomes</h3>
                    {[1, 2, 3, 4, 5].map((co) => (
                      <div className="space-y-2" key={co}>
                        <label className="text-sm font-medium">CO{co}</label>
                        <input
                          type="text"
                          value={formFields[`co${co}`]}
                          onChange={(e) => handleFieldChange(`co${co}`, e.target.value)}
                          className="form-input"
                          placeholder={`Enter Course Outcome ${co}`}
                        />
                      </div>
                    ))}

                    {/* Resources */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Text Books</label>
                      <textarea
                        value={formFields.textBooks}
                        onChange={(e) => handleFieldChange('textBooks', e.target.value)}
                        className="form-input"
                        placeholder="Enter text books..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reference Books</label>
                      <textarea
                        value={formFields.references}
                        onChange={(e) => handleFieldChange('references', e.target.value)}
                        className="form-input"
                        placeholder="Enter reference books..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">YouTube Resources</label>
                      <textarea
                        value={formFields.ytResources}
                        onChange={(e) => handleFieldChange('ytResources', e.target.value)}
                        className="form-input"
                        placeholder="Enter YouTube resource links..."
                      />
                    </div>
                  </div>

                  {/* Generate PDF Button */}
                  <div className="text-center">
                    <Button
                      onClick={handleGeneratePDF}
                      className="w-full md:w-auto"
                      isLoading={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate PDF'}
                    </Button>
                  </div>
                </div>
              )}

              
      
              
              {/* Step 4: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Generated PDF</h3>
                    
                    <div className="border rounded-md h-96 flex items-center justify-center bg-secondary/20">
                      <div className="text-center space-y-2">
                        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">PDF preview would appear here in a real implementation</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Summary</h3>
                      
                      <div className="rounded-md border bg-secondary/20 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Title</p>
                            <p className="text-muted-foreground">{title}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Subject Code</p>
                            <p className="text-muted-foreground">{subject}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Regulation</p>
                            <p className="text-muted-foreground">{regulation}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Semester</p>
                            <p className="text-muted-foreground">Semester {semester}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back to Edit
                    </Button>
                    
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => toast.success('PDF downloaded successfully')}
                      >
                        Download PDF
                      </Button>
                      <Button 
                        onClick={handleSubmitSyllabus} 
                        isLoading={isSubmitting}
                      >
                        Submit to HOD
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation buttons */}
            <div className="card-footer justify-between">
              {currentStep < 3 && (
                <div className="flex justify-between w-full">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handlePrevStep}>
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 2 && (
                    <Button onClick={handleNextStep}>
                      Next
                    </Button>
                  )}
                  
                  {currentStep === 1 && (
                    <div></div> // Empty div for flex alignment when there's no back button
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateSyllabus;