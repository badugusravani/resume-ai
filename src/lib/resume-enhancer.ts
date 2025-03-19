import OpenAI from 'openai';
import { enhanceResumeWithGemini, generateCoverLetterWithGemini } from './gemini';

// Get API key from environment variables
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

// Create the OpenAI client with proper error handling
let openai: OpenAI | null = null;
try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY || 'dummy-key', // Use a fallback to prevent errors
    dangerouslyAllowBrowser: true
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  // Continue without OpenAI - we'll fallback to Gemini
}

// Function to enhance resume content with AI suggestions
export const enhanceResume = async (resumeData: any) => {
  // Default to using Gemini
  return await enhanceResumeWithGemini(resumeData);
};

// Function to generate a cover letter based on resume and job description
export const generateCoverLetter = async (resumeData: any, jobDescription: string) => {
  // Default to using Gemini
  return await generateCoverLetterWithGemini(resumeData, jobDescription);
};