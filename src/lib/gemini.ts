import { GoogleGenerativeAI } from '@google/generative-ai';
import { HfInference } from '@huggingface/inference';
import { getEnv } from '../utils/env';

// Initialize the Gemini API with the provided API key
const GEMINI_API_KEY = getEnv('VITE_GEMINI_API_KEY', 'AIzaSyClBAprRCqqFPs4a4Vfi_qqZsgceM4-Tqo');
const HF_API_KEY = getEnv('HF_API_KEY', '');

// Create the API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const hf = HF_API_KEY ? new HfInference(HF_API_KEY) : null;

// Function to parse resume using Gemini API
export const parseResumeWithGemini = async (text: string) => {
  try {
    console.log('Initializing Gemini model for resume parsing...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Extract key role information using regex
    const rolePattern = /(?:role|position|title)s?:?\s*([^\n,\.]+)/i;
    const experiencePattern = /(\d+)(?:\+)?\s*(?:years|yrs|yr)(?:\s*of)?\s*experience/i;
    const specialtyPattern = /(?:specialist|speciali[sz]ing|expertise)\s*(?:in|:)?\s*([^\n,\.]+)/i;
    const industryPattern = /(?:industry|sector|field)\s*(?:in|:)?\s*([^\n,\.]+)/i;

    // Extract matches
    const roleMatch = text.match(rolePattern);
    const experienceMatch = text.match(experiencePattern);
    const specialtyMatch = text.match(specialtyPattern);
    const industryMatch = text.match(industryPattern);

    // Construct prompt based on extracted information
    const prompt = `Parse the following resume text into structured JSON format:

${text}

IMPORTANT SKILL HANDLING INSTRUCTIONS:
- ONLY include skills that are EXPLICITLY mentioned in the resume text
- DO NOT generate or infer additional skills not present in the text
- If technical skills appear to be missing, include a property "missingSkills": true
- Do not make up or generate any skills that aren't clearly stated in the resume

Extract into this exact JSON structure:
{
  "name": "Full Name",
  "title": "Professional Title/Role",
  "contact": {
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, State/Country"
  },
  "summary": "Professional summary",
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "duration": "Start date - End date",
      "description": "Job description"
    }
  ],
  "education": [
    {
      "school": "Institution name",
      "degree": "Degree name",
      "year": "Graduation year"
    }
  ],
  "skills": ["Only include skills explicitly mentioned in the resume"],
  "missingSkills": boolean (true if skills section appears incomplete)
}

Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    try {
      const parsedData = JSON.parse(jsonText);
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini response:', parseError);
      console.log('Received text:', jsonText);
      throw new Error('Failed to parse resume data from AI response');
    }
  } catch (error) {
    console.error('Error in parseResumeWithGemini:', error);
    throw error;
  }
};

// Function to enhance resume using Gemini API
export const enhanceResumeWithGemini = async (resumeData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
      You are an expert AI resume enhancer. Transform this resume data to make it more powerful and impactful.
      
      Original Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Enhancement Requirements:
      1. For Education:
         - Add relevant coursework highlights
         - Include academic achievements and projects
         - Quantify academic performance with metrics
         - Highlight any special recognition or awards

      2. For Projects:
         - Transform descriptions to highlight problem-solving
         - Add quantifiable impact and results
         - Emphasize technical challenges overcome
         - Include specific technologies and methodologies used
         - Add metrics where possible (e.g., performance improvements, user impact)

      3. For Skills:
         - Group skills by proficiency level
         - Add relevant industry-standard tools and frameworks
         - Include both technical and soft skills
         - Highlight in-demand skills for the industry

      4. For Certifications:
         - Add relevance to career goals
         - Include certification dates and issuing organizations
         - Highlight specific skills validated by each certification

      5. For Hobbies:
         - Connect hobbies to professional skills
         - Highlight leadership and team activities
         - Show continuous learning and growth

      Important Rules:
      1. Keep all original information intact
      2. Only enhance existing content, don't invent new information
      3. Make all achievements quantifiable where possible
      4. Use strong action verbs
      5. Focus on results and impact
      6. Maintain ATS-friendly formatting
      7. Keep the same data structure

      Return the enhanced resume data in the exact same JSON structure.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Extract JSON from the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const enhancedData = JSON.parse(jsonMatch[0]);

    // Log the enhancements for verification
    console.log('AI Enhancements Applied:');
    console.log('------------------------');
    Object.keys(enhancedData).forEach(section => {
      if (JSON.stringify(enhancedData[section]) !== JSON.stringify(resumeData[section])) {
        console.log(`Enhanced ${section}`);
      }
    });

    return enhancedData;
  } catch (error) {
    console.error('Error enhancing resume with Gemini:', error);
    throw error;
  }
};

// Function to generate a cover letter using Gemini API
export const generateCoverLetterWithGemini = async (resumeData: any, jobDescription: string) => {
  try {
    // Get the generative model
    // Using gemini-1.5-pro model which is available in the current API version
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Create the prompt for cover letter generation
    const prompt = `
      Create a professional cover letter based on my resume and the job description.
      
      My Resume:
      Name: ${resumeData.name}
      Title: ${resumeData.title}
      Summary: ${resumeData.summary}
      
      Experience:
      ${resumeData.experience.map((exp: any) => 
        `- ${exp.position} at ${exp.company} (${exp.duration})\n  ${exp.description}`
      ).join('\n')}
      
      Education:
      ${resumeData.education.map((edu: any) => 
        `- ${edu.degree} from ${edu.school} (${edu.year})`
      ).join('\n')}
      
      Skills: ${resumeData.skills.join(', ')}
      
      Job Description:
      ${jobDescription}
      
      Create a compelling cover letter that highlights my relevant experience and skills for this position.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating cover letter with Gemini:', error);
    throw error;
  }
};

// Function to enhance text using available AI services
export const enhanceText = async (text: string, context: string) => {
  try {
    // Try Gemini first
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const prompt = `
        Enhance the following text to make it more professional and impactful.
        If the text contains ALL CAPS, convert it to proper case.
        Context: ${context}
        Text to enhance: ${text}
        
        Rules:
        1. Maintain factual accuracy
        2. Use industry-standard terminology
        3. Be concise but descriptive
        4. Fix any grammatical issues
        5. Convert ALL CAPS to proper case
        6. Use active voice
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (geminiError) {
      console.warn('Gemini API failed, trying HuggingFace:', geminiError);
      
      // If Gemini fails and HuggingFace is available, try that
      if (hf) {
        const result = await hf.textGeneration({
          model: 'gpt2',
          inputs: `Enhance this professional text: ${text}\nContext: ${context}`,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7
          }
        });
        return result.generated_text;
      }
      
      // If both fail, throw error
      throw new Error('All AI services failed');
    }
  } catch (error) {
    console.error('Error enhancing text:', error);
    // Return original text if enhancement fails
    return text;
  }
};

// Function to generate career objective using Gemini AI
export const generateCareerObjective = async (resumeData: ResumeData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `
      Generate a compelling career objective based on the following information:
      
      Name: ${resumeData.personalInfo.name}
      Experience Level: ${resumeData.experience.length > 0 ? 'Experienced Professional' : 'Fresh Graduate'}
      Education: ${resumeData.education.map(edu => `${edu.degree} from ${edu.institution}`).join(', ')}
      Skills: ${resumeData.skills.technical.join(', ')}
      ${resumeData.experience.length > 0 ? `Current Role: ${resumeData.experience[0].title}` : ''}
      
      Rules:
      1. Keep it under 3 sentences
      2. Highlight key strengths
      3. Align with industry standards
      4. Make it specific to their background
      5. Include career aspirations
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating career objective with Gemini:', error);
    throw error;
  }
};

interface ResumePersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface ResumeExperience {
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string;
  achievements: string[];
}

interface ResumeEducation {
  degree: string;
  institution: string;
  location?: string;
  year: string;
  gpa?: string;
  achievements?: string[];
}

interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

interface ResumeSkills {
  technical: string[];
  soft: string[];
  certifications: string[];
}

interface ResumeData {
  personalInfo: ResumePersonalInfo;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  projects: ResumeProject[];
  experienceLevel: string;
}

export const generateSampleLatexResume = async (resumeData: ResumeData) => {
  const model = new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    console.log("Starting AI-powered resume enhancement...");
    
    // First, enhance the resume content with AI
    const enhancedData = await enhanceResumeWithGemini(resumeData);
    console.log("Resume content enhanced with AI improvements");

    // Now generate the LaTeX with the enhanced content
    const latexPrompt = `
      Generate a professional LaTeX resume using this AI-enhanced data:
      ${JSON.stringify(enhancedData, null, 2)}

      Requirements:
      1. Create a professional LaTeX resume with these exact sections in order:
         ${resumeData.experienceLevel === 'fresher' ? `
         - Header (Name, DOB, Email, Phone, Location)
         - Education Section:
           * Institution name with location
           * Degree and field of study
           * Graduation date and GPA if available
           * Relevant coursework and achievements
         - Technical Skills Section:
           * Grouped by categories
           * Highlight proficiency levels
         - Projects Section:
           * Project name with technologies used
           * Problem statement and solution
           * Quantifiable results and impact
           * GitHub/live links if available
         - Certifications Section (if any):
           * Name with issuing organization
           * Date and expiration if applicable
         - Hobbies & Interests:
           * Focus on relevant activities
           * Show leadership and team skills` 
         : `
         - Header (Name, DOB, Email, Phone, Location)
         - Professional Experience:
           * Current role with key achievements
           * Previous roles with impact
           * Quantifiable results
         - Education
         - Technical Skills
         - Certifications
         - Hobbies & Interests`}

      2. Use modern LaTeX formatting:
         - Use \\section{} for main sections
         - Use \\subsection{} for subsections
         - Use itemize for bullet points
         - Use \\textbf{} for emphasis
         - Use \\href{} for links
         - Proper spacing between sections
         - Clean and consistent alignment

      3. Make it ATS-friendly:
         - Use standard section names
         - Include keywords from the enhanced data
         - Maintain clean formatting
         - No complex LaTeX layouts that might confuse ATS

      Return ONLY the complete LaTeX code.
    `;

    const latexResult = await model.generateContent(latexPrompt);
    if (!latexResult.response) {
      throw new Error('Failed to generate LaTeX code');
    }

    let latexCode = latexResult.response.text();
    latexCode = latexCode.trim()
      .replace(/^```(?:latex)?\s*/, '')
      .replace(/\s*```$/, '');

    // Validate the LaTeX code
    if (!latexCode.includes('\\documentclass')) {
      throw new Error('Generated LaTeX code is missing document class');
    }

    console.log("LaTeX resume generated successfully with AI enhancements");
    return latexCode;

  } catch (error) {
    console.error('Error generating LaTeX resume:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate LaTeX resume');
  }
};