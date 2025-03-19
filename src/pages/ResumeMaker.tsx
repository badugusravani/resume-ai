import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '../contexts/CreditContext';
import { ResumeTemplates } from '../components/ResumeTemplates';
import { generateSampleLatexResume, generateCareerObjective, enhanceText } from '../lib/gemini';
import ResumeCorrectionsChat from '../components/ResumeCorrectionsChat';
import { toast } from 'react-hot-toast';

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade: string;
  location: string;
}

interface Experience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

interface ResumeData {
  // Basic Information
  name: string;
  dob: string;
  email: string;
  phone: string;
  location: string;
  experienceLevel: 'fresher' | 'experienced';
  
  // Fresher Details
  education: Education[];
  hobbies: string;
  academicProjects: Project[];
  
  // Experienced Professional Details
  experiences: Experience[];
  currentRole: string;
  targetRole: string;
  
  // Common
  skills: string[];
  certifications: string[];
  isEnhancedWithAI: boolean;
}

const ResumeMaker: React.FC = () => {
  const { totalCredits, useCredit } = useCredits();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [generatedLatex, setGeneratedLatex] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const [resumeData, setResumeData] = useState<ResumeData>({
    name: '',
    dob: '',
    email: '',
    phone: '',
    location: '',
    experienceLevel: 'fresher',
    education: [{
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      grade: '',
      location: ''
    }],
    hobbies: '',
    academicProjects: [{
      name: '',
      description: '',
      technologies: ''
    }],
    experiences: [{
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: ''
    }],
    currentRole: '',
    targetRole: '',
    skills: [],
    certifications: [],
    isEnhancedWithAI: false
  });

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        grade: '',
        location: ''
      }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        responsibilities: ''
      }]
    }));
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      academicProjects: prev.academicProjects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      academicProjects: [...prev.academicProjects, {
        name: '',
        description: '',
        technologies: ''
      }]
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setResumeData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleCertificationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const certificationsArray = e.target.value.split(',').map(cert => cert.trim()).filter(Boolean);
    setResumeData(prev => ({
      ...prev,
      certifications: certificationsArray
    }));
  };

  const handleHobbiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeData(prev => ({
      ...prev,
      hobbies: e.target.value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateResume = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Deduct credits - use 1 credit for resume generation
      const success = await useCredit();
      if (!success) {
        throw new Error('Insufficient credits');
      }

      // Convert resumeData to the format expected by the LaTeX template
      const formattedData: any = {
        personalInfo: {
          name: resumeData.name,
          email: resumeData.email,
          phone: resumeData.phone,
          location: resumeData.location,
          linkedIn: '', // Optional field
          portfolio: '', // Optional field
          summary: resumeData.experienceLevel === 'fresher' 
            ? `Fresh graduate with ${resumeData.education[0].degree} in ${resumeData.education[0].field} from ${resumeData.education[0].institution}`
            : `${resumeData.currentRole} seeking opportunities as ${resumeData.targetRole}`
        },
        experience: resumeData.experienceLevel === 'experienced' 
          ? resumeData.experiences.map(exp => ({
              title: exp.role,
              company: exp.company,
              location: exp.location,
              duration: `${exp.startDate} - ${exp.endDate}`,
              description: exp.responsibilities,
              achievements: exp.responsibilities.split('\n').filter(Boolean)
            }))
          : [],
        education: resumeData.education.map(edu => ({
          degree: `${edu.degree} in ${edu.field}`,
          institution: edu.institution,
          location: '', // Optional field
          year: `${edu.startDate} - ${edu.endDate}`,
          gpa: edu.grade,
          achievements: [] // Optional field
        })),
        skills: {
          technical: resumeData.skills,
          soft: [],
          certifications: resumeData.certifications,
          languages: [] // Optional field
        },
        projects: resumeData.academicProjects.map(proj => ({
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies.split(',').map(tech => tech.trim()),
          link: proj.link
        }))
      };

      // Generate LaTeX resume
      console.log('Generating LaTeX resume with formatted data:', formattedData);
      const latex = await generateSampleLatexResume(formattedData);
      
      if (!latex) {
        throw new Error('Failed to generate LaTeX content');
      }
      
      setGeneratedLatex(latex);
      setShowChat(true);
      toast.success('Resume generated successfully!');
      
    } catch (err) {
      console.error('Resume generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResume = (newLatex: string) => {
    setGeneratedLatex(newLatex);
    toast.success('Resume has been updated!');
  };

  const enhanceWithAI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Deduct credits
      const success = await useCredit();
      if (!success) {
        throw new Error('Insufficient credits');
      }

      // Format data for AI enhancement
      const formattedData: any = {
        personalInfo: {
          name: resumeData.name,
          email: resumeData.email,
          phone: resumeData.phone,
          location: resumeData.location,
          summary: resumeData.experienceLevel === 'fresher' 
            ? `Fresh graduate with ${resumeData.education[0].degree} in ${resumeData.education[0].field} from ${resumeData.education[0].institution}`
            : `${resumeData.currentRole} seeking opportunities as ${resumeData.targetRole}`
        },
        experience: resumeData.experiences.map(exp => ({
          title: exp.role,
          company: exp.company,
          location: exp.location,
          duration: `${exp.startDate} - ${exp.endDate}`,
          description: exp.responsibilities,
          achievements: exp.responsibilities.split('\n').filter(Boolean)
        })),
        education: resumeData.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          year: `${edu.startDate} - ${edu.endDate}`,
          gpa: edu.grade,
          achievements: []
        })),
        skills: {
          technical: resumeData.skills,
          soft: [],
          certifications: resumeData.certifications
        },
        projects: resumeData.academicProjects.map(proj => ({
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies.split(',').map(tech => tech.trim()),
          link: proj.link
        }))
      };

      // Generate career objective
      const careerObjective = await generateCareerObjective(formattedData);

      // Enhance experience descriptions with metrics and achievements
      const enhancedExperiences = await Promise.all(
        resumeData.experiences.map(async (exp) => ({
          ...exp,
          responsibilities: await enhanceText(
            exp.responsibilities,
            `Role: ${exp.role} at ${exp.company}. Convert to achievement-based bullets with metrics.`
          )
        }))
      );

      // Enhance project descriptions
      const enhancedProjects = await Promise.all(
        resumeData.academicProjects.map(async (proj) => ({
          ...proj,
          description: await enhanceText(
            proj.description,
            `Academic project using ${proj.technologies}. Focus on technical implementation and results.`
          )
        }))
      );

      // Update resume data with enhanced content
      setResumeData(prev => ({
        ...prev,
        experiences: enhancedExperiences,
        academicProjects: enhancedProjects,
        summary: careerObjective,
        isEnhancedWithAI: true
      }));

      toast.success('Resume enhanced with AI successfully!');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to enhance resume with AI. Please try again.');
      setLoading(false);
    }
  };

  const renderBasicInfoForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          name="name"
          value={resumeData.name}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={resumeData.dob}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={resumeData.email}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="john.doe@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={resumeData.phone}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={resumeData.location}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="City, Country"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
        <select
          name="experienceLevel"
          value={resumeData.experienceLevel}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="fresher">Fresher</option>
          <option value="experienced">Experienced</option>
        </select>
      </div>
    </div>
  );

  const renderEducationForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Education</h2>
      
      {resumeData.education.map((edu, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., Bachelor of Science, Master of Technology"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., University of Technology"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={edu.location}
              onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., New York, USA"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={edu.endDate}
                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade/CGPA
            </label>
            <input
              type="text"
              value={edu.grade}
              onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., 3.8/4.0 or First Class with Distinction"
            />
          </div>

          {index > 0 && (
            <button
              type="button"
              onClick={() => {
                setResumeData(prev => ({
                  ...prev,
                  education: prev.education.filter((_, i) => i !== index)
                }));
              }}
              className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Remove Education
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addEducation}
        className="w-full py-2 px-4 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
      >
        + Add Another Education
      </button>
    </div>
  );

  const renderExperienceForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
        <input
          type="text"
          name="currentRole"
          value={resumeData.currentRole}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Senior Software Engineer"
        />
      </div>

              <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
        <input
          type="text"
          name="targetRole"
          value={resumeData.targetRole}
          onChange={handleBasicInfoChange}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Technical Lead"
        />
      </div>
      
      {resumeData.experiences.map((exp, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={exp.company}
              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={exp.role}
              onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={exp.location}
              onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="City, Country"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities & Achievements</label>
            <textarea
              value={exp.responsibilities}
              onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={4}
              placeholder="• Led a team of 5 developers&#10;• Improved system performance by 30%&#10;• Implemented CI/CD pipeline"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExperience}
        className="w-full py-2 px-4 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
      >
        + Add Another Experience
      </button>
    </div>
  );

  const renderSkillsAndCertificationsForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Skills & Certifications</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
        <textarea
          value={resumeData.skills.join(', ')}
          onChange={handleSkillsChange}
          className="w-full border border-gray-300 rounded-md p-2"
          rows={4}
          placeholder="Enter your skills, separated by commas (e.g. JavaScript, React, Node.js)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
        <textarea
          value={resumeData.certifications.join(', ')}
          onChange={handleCertificationsChange}
          className="w-full border border-gray-300 rounded-md p-2"
          rows={4}
          placeholder="Enter your certifications, separated by commas (e.g. AWS Solutions Architect, Google Cloud Professional)"
        />
      </div>

      {resumeData.experienceLevel === 'fresher' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies & Interests</label>
          <textarea
            value={resumeData.hobbies}
            onChange={handleHobbiesChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            placeholder="Enter your hobbies and interests"
          />
        </div>
      )}

      {resumeData.experienceLevel === 'fresher' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mt-8 mb-4">Academic Projects</h3>
          {resumeData.academicProjects.map((project, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g., E-commerce Website, Machine Learning Model"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  placeholder="Describe your project, its features, and your role. Include metrics if applicable."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologies Used <span className="text-red-500">*</span>
                </label>
                  <input
                  type="text"
                  value={project.technologies}
                  onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link
                </label>
                <input
                  type="url"
                  value={project.link || ''}
                  onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g., https://github.com/yourusername/project"
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      academicProjects: prev.academicProjects.filter((_, i) => i !== index)
                    }));
                  }}
                  className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Remove Project
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addProject}
            className="w-full py-2 px-4 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
          >
            + Add Another Project
          </button>
        </div>
      )}
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
      <ResumeTemplates
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
      />
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Review Your Information</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{resumeData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{resumeData.dob}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{resumeData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{resumeData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{resumeData.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Experience Level</p>
              <p className="font-medium capitalize">{resumeData.experienceLevel}</p>
            </div>
          </div>
        </div>

        {resumeData.experienceLevel === 'experienced' ? (
          <div>
            <h3 className="text-lg font-medium mb-2">Professional Experience</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Role</p>
                <p className="font-medium">{resumeData.currentRole}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Target Role</p>
                <p className="font-medium">{resumeData.targetRole}</p>
              </div>
              {resumeData.experiences.map((exp, index) => (
                <div key={index} className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{exp.company}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{exp.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{exp.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{exp.startDate} - {exp.endDate}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Responsibilities & Achievements</p>
                    <p className="font-medium whitespace-pre-line">{exp.responsibilities}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
                  ) : (
                    <>
            <div>
              <h3 className="text-lg font-medium mb-2">Education</h3>
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Institution</p>
                        <p className="font-medium">{edu.institution}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Degree</p>
                        <p className="font-medium">{edu.degree}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Field of Study</p>
                        <p className="font-medium">{edu.field}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{edu.startDate} - {edu.endDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Grade/CGPA</p>
                        <p className="font-medium">{edu.grade}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Academic Projects</h3>
              <div className="space-y-4">
                {resumeData.academicProjects.map((project, index) => (
                  <div key={index} className="border-t pt-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Project Name</p>
                        <p className="font-medium">{project.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{project.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Technologies Used</p>
                        <p className="font-medium">{project.technologies}</p>
                      </div>
                      {project.link && (
                        <div>
                          <p className="text-sm text-gray-500">Project Link</p>
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                            {project.link}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Hobbies & Interests</h3>
              <p className="whitespace-pre-line">{resumeData.hobbies}</p>
            </div>
          </>
        )}

        <div>
          <h3 className="text-lg font-medium mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.certifications.map((cert, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Resume Builder</h1>
      
      {/* Credits Display */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-blue-700">
          Available Credits: {totalCredits}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index < currentStep ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    index < currentStep - 1 ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm">Basic Info</span>
          <span className="text-sm">{resumeData.experienceLevel === 'fresher' ? 'Education' : 'Experience'}</span>
          <span className="text-sm">Skills</span>
          <span className="text-sm">Template</span>
          <span className="text-sm">Review</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {currentStep === 1 && renderBasicInfoForm()}
        {currentStep === 2 && (
          resumeData.experienceLevel === 'fresher' ? renderEducationForm() : renderExperienceForm()
        )}
        {currentStep === 3 && renderSkillsAndCertificationsForm()}
        {currentStep === 4 && renderTemplateSelection()}
        {currentStep === 5 && renderReviewStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md ${
              currentStep === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          <div className="flex gap-4">
            {currentStep < totalSteps && (
              <button
                onClick={nextStep}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Next
              </button>
            )}
            {currentStep === totalSteps ? (
              <button
                onClick={generateResume}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Generate Resume'}
              </button>
            ) : (
              <button
                onClick={enhanceWithAI}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Enhance with AI'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generated Resume Display */}
      {generatedLatex && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated Resume</h2>
          <div className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto mb-6">
            <pre className="whitespace-pre-wrap">{generatedLatex}</pre>
          </div>
          
          {/* Toggle chat button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-md"
            >
              {showChat ? 'Hide Chat Assistant' : 'Show Chat Assistant'}
            </button>
          </div>
          
          {/* Chat component */}
          {showChat && (
            <div className="mb-8">
              <ResumeCorrectionsChat
                resumeLatex={generatedLatex}
                onUpdateResume={handleUpdateResume}
              />
              <p className="text-sm text-gray-600 mt-2">
                You get 3 free correction messages per resume. After that, each message costs 2 credits.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeMaker;