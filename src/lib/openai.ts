import OpenAI from 'openai';
import { parseResumeWithGemini } from './gemini';
import { getEnv } from '../utils/env';

// Determine if we're in a test environment
const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

// Get API key safely using our utility
const OPENAI_API_KEY = getEnv('OPENAI_API_KEY', 'dummy-key');

// Create the OpenAI client with proper error handling
let openai: OpenAI | null = null;
try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  // Continue without OpenAI - we'll fallback to Gemini
}

export const parseResume = async (text: string) => {
  try {
    // Try OpenAI first
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a professional resume parser. Extract information from the provided text and format it into sections: personal info, summary, experience, education, and skills. Format the response as JSON matching this structure: { name: string, title: string, contact: { email: string, phone: string, location: string }, summary: string, experience: Array<{ company: string, position: string, duration: string, description: string }>, education: Array<{ school: string, degree: string, year: string }>, skills: string[] }"
            },
            {
              role: "user",
              content: text
            }
          ],
          model: "gpt-3.5-turbo",
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) throw new Error('No response from OpenAI');

        return JSON.parse(response);
      } catch (openAiError) {
        console.error('Error with OpenAI, falling back to Gemini:', openAiError);
        // Fall back to Gemini if OpenAI fails
        return await parseResumeWithGemini(text);
      }
    } else {
      // OpenAI wasn't initialized, use Gemini directly
      return await parseResumeWithGemini(text);
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
};