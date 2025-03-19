import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '../utils/env';

// Get the API key safely using our utility
const GEMINI_API_KEY = getEnv('VITE_GEMINI_API_KEY', 'test-gemini-key');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    duration: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    year: string;
    gpa?: string;
    achievements?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

export interface OptimizationOptions {
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel?: 'fresher' | 'entry' | 'mid' | 'senior' | 'executive';
  experienceYears?: number;
  specialty?: string;
  focusAreas?: ('technical' | 'leadership' | 'achievements' | 'metrics')[];
}

export const optimizeResume = async (
  resumeData: ResumeData, 
  modelSelection: 'auto' | 'gemini' | 'openai' = 'auto',
  options: OptimizationOptions = {}
): Promise<ResumeData> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Determine appropriate experience level
  let experienceLevelDescription = options.experienceLevel || 'Not specified';
  if (options.experienceYears !== undefined) {
    if (options.experienceYears === 0) {
      experienceLevelDescription = 'Fresher (No professional experience)';
    } else if (options.experienceYears < 3) {
      experienceLevelDescription = 'Entry Level';
    } else if (options.experienceYears < 6) {
      experienceLevelDescription = 'Mid Level';
    } else if (options.experienceYears < 10) {
      experienceLevelDescription = 'Senior Level';
    } else {
      experienceLevelDescription = 'Executive Level';
    }
  }

  const prompt = `
    Act as an expert ATS optimization specialist and professional resume writer.
    Enhance the following resume content to make it more impactful and ATS-friendly.
    
    Target Role: ${options.targetRole || (resumeData?.personalInfo ? resumeData.personalInfo.name : 'Not specified')}
    Target Industry: ${options.targetIndustry || 'Not specified'}
    Experience Level: ${experienceLevelDescription}
    ${options.experienceYears !== undefined ? `Years of Experience: ${options.experienceYears}` : ''}
    ${options.specialty ? `Specialty: ${options.specialty}` : ''}
    Focus Areas: ${options.focusAreas?.join(', ') || 'All areas'}

    Guidelines:
    1. Use industry-standard keywords and action verbs
    2. Add quantifiable achievements and metrics
    3. Ensure clear and impactful descriptions
    4. Optimize for ATS readability
    5. Highlight relevant skills and experiences
    6. Use consistent formatting
    7. Include measurable results and impact
    8. Emphasize leadership and soft skills where applicable
    ${options.experienceLevel === 'fresher' ? `
    9. For a fresher with no experience, focus on:
       - Educational achievements and relevant coursework
       - Internships or academic projects
       - Technical skills and certifications
       - Soft skills and personal attributes
       - Volunteer work or extracurricular activities
    ` : ''}

    Original Resume Data:
    ${JSON.stringify(resumeData, null, 2)}

    Please provide an optimized version maintaining the same structure but with enhanced content.
    Focus on making each bullet point impactful and results-oriented.
    ${options.experienceLevel === 'fresher' ? 'Create appropriate experience entries based on any projects, internships, or relevant academic work mentioned.' : ''}
  `;

  try {
    // Currently only Gemini is implemented, but in future we can add OpenAI support based on modelSelection
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const optimizedData = JSON.parse(response.text());
    return optimizedData;
  } catch (error) {
    console.error('Error optimizing resume:', error);
    throw new Error('Failed to optimize resume');
  }
};

export const generateCoverLetter = async (
  resumeData: ResumeData,
  jobDescription: string,
  companyName: string
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    Act as a professional cover letter writer.
    Create a compelling cover letter based on the candidate's resume and the job description.
    
    Resume Data:
    ${JSON.stringify(resumeData, null, 2)}

    Job Description:
    ${jobDescription}

    Company: ${companyName}

    Guidelines:
    1. Maintain a professional yet engaging tone
    2. Highlight relevant experiences and skills
    3. Show enthusiasm for the role and company
    4. Connect past achievements to future contributions
    5. Keep it concise (max 400 words)
    6. Include specific examples from the resume
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter');
  }
};

export const generateAchievementBullets = async (
  description: string,
  role: string
): Promise<string[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    Transform the following job description into powerful achievement-oriented bullet points.
    Focus on quantifiable results, impact, and specific contributions.
    Use strong action verbs and include metrics where possible.

    Role: ${role}
    Description: ${description}

    Guidelines:
    1. Start with strong action verbs
    2. Include specific metrics and numbers
    3. Show impact and results
    4. Be concise yet descriptive
    5. Use industry-relevant keywords
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error generating achievement bullets:', error);
    throw new Error('Failed to generate achievement bullets');
  }
};

export const generateLatexTemplate = async (
  resumeData: ResumeData,
  templateStyle: string = 'modern'
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Define the exact LaTeX template structure
  const latexTemplate = `\\documentclass[a4paper,10pt]{article}
\\usepackage[left=0.8in, right=0.8in, top=0.5in, bottom=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\renewcommand{\\baselinestretch}{1.2}

% Formatting section titles
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{} % Title formatting (large and bold)
\\titlespacing*{\\section}{0pt}{1ex plus 0.5ex minus 0.5ex}{0pt} % Adjust spacing before and after section titles
\\titleformat{\\section}
  {\\large\\bfseries} % Large, bold section titles
  {} % No label before title
  {0em} % No extra space before title
  {} % No additional formatting before title
  [\\titlerule[0.8pt]] % Rule below the section title (full width)
  \\vspace{-2pt} % Small space after the horizontal line

\\begin{document}
\\pagestyle{empty}

% Name and Contact Information
\\begin{center}
    {\\LARGE\\textbf{FULL_NAME}}\\\\
    LOCATION \\hspace{1cm} 
    PHONE_NUMBER \\hspace{1cm} 
    \\href{mailto:EMAIL}{EMAIL} \\hspace{1cm} 
    \\href{LINKEDIN_URL}{LINKEDIN_HANDLE}
\\end{center}

\\section*{Professional Summary}
PROFESSIONAL_SUMMARY

\\section*{Key Skills}
\\begin{itemize}[noitemsep,topsep=0pt]
    SKILLS_LIST
\\end{itemize}

\\section*{Professional Experience}
WORK_EXPERIENCE

\\section*{Education}
EDUCATION

\\section*{Certifications}
CERTIFICATIONS

\\end{document}`;

  const prompt = `
    You are a professional resume writer specializing in LaTeX templates. 
    Generate an ATS-friendly LaTeX resume for the following data using EXACTLY this template structure:

    ${latexTemplate}

    Replace the placeholder fields with appropriate content based on this resume data:
    ${JSON.stringify(resumeData, null, 2)}

    Important instructions:
    1. Use EXACTLY the LaTeX template structure provided above
    2. Replace FULL_NAME, LOCATION, PHONE_NUMBER, EMAIL, LINKEDIN_URL, and LINKEDIN_HANDLE with FICTIONAL data
    3. Generate appropriate content for PROFESSIONAL_SUMMARY, SKILLS_LIST, WORK_EXPERIENCE, EDUCATION, and CERTIFICATIONS
    4. Format the work experience section exactly as shown in the template, with company name in bold, job title in italics, and dates right-aligned
    5. Use bullets for listing responsibilities and achievements under each position
    6. Bold important keywords and metrics in bullet points to catch the eye of recruiters
    7. Ensure the final output is 100% compatible with Overleaf
    8. Make sure to keep all the formatting commands exactly as provided
    9. DO NOT include any additional sections or change the template structure

    Return only the complete LaTeX code, nothing else.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating LaTeX template:', error);
    throw new Error('Failed to generate LaTeX template');
  }
}; 