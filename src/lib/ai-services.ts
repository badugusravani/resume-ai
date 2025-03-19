import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { parseResumeWithGemini } from './gemini';
import { getEnv } from '../utils/env';

// Determine if we're in a test environment
const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

// Get API keys safely using our utility
const OPENAI_API_KEY = getEnv('OPENAI_API_KEY', 'dummy-key');
const HF_API_KEY = getEnv('HF_API_KEY', 'dummy-key');

// Initialize OpenAI client with error handling
let openai: OpenAI | null = null;
try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY || 'dummy-key', // Use a fallback to prevent errors
    dangerouslyAllowBrowser: true
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  // Continue without OpenAI - we'll fallback to other services
}

// Initialize HuggingFace with error handling
let hf: HfInference | null = null;
try {
  if (HF_API_KEY) {
    hf = new HfInference(HF_API_KEY);
  }
} catch (error) {
  console.error('Error initializing HuggingFace client:', error);
  // Continue without HuggingFace
}

async function parseWithOpenAI(text: string) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

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
}

async function parseWithHuggingFace(text: string) {
  if (!hf) {
    throw new Error('HuggingFace client not initialized');
  }

  const response = await hf.textGeneration({
    model: 'gpt2',
    inputs: `Parse this resume and format as JSON with sections for personal info, summary, experience, education, and skills:\n\n${text}`,
    parameters: {
      max_new_tokens: 1000,
      temperature: 0.7,
      return_full_text: false,
    }
  });

  try {
    // Clean up the response and parse as JSON
    const jsonStr = response.generated_text.replace(/```json|\```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    throw new Error('Failed to parse HuggingFace response');
  }
}

export async function parseResume(text: string, model: 'auto' | 'gemini' | 'openai' = 'auto') {
  // Track which services we've tried
  const errors = [];
  
  // If a specific model is requested, try only that one
  if (model === 'gemini') {
    try {
      console.log('Parsing resume with Gemini...');
      return await parseResumeWithGemini(text);
    } catch (geminiError: unknown) {
      console.error('Gemini error:', geminiError);
      const errorMessage = geminiError instanceof Error 
        ? geminiError.message 
        : 'Unknown error';
      throw new Error(`Gemini service failed: ${errorMessage}`);
    }
  }
  
  if (model === 'openai') {
    if (!openai) {
      throw new Error('OpenAI client not initialized or API key not provided');
    }
    try {
      console.log('Parsing resume with OpenAI...');
      return await parseWithOpenAI(text);
    } catch (openAiError: unknown) {
      console.error('OpenAI error:', openAiError);
      const errorMessage = openAiError instanceof Error 
        ? openAiError.message 
        : 'Unknown error';
      throw new Error(`OpenAI service failed: ${errorMessage}`);
    }
  }
  
  // If auto mode or fallback is requested, try services in order
  try {
    console.log('Attempting to parse resume with Gemini...');
    return await parseResumeWithGemini(text);
  } catch (geminiError: unknown) {
    console.error('Gemini error:', geminiError);
    errors.push(`Gemini: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
    
    // Try OpenAI next
    if (openai) {
      try {
        console.log('Falling back to OpenAI...');
        return await parseWithOpenAI(text);
      } catch (openAiError: unknown) {
        console.error('OpenAI error:', openAiError);
        errors.push(`OpenAI: ${openAiError instanceof Error ? openAiError.message : 'Unknown error'}`);
      }
    }
    
    // Try HuggingFace as last resort
    if (hf) {
      try {
        console.log('Falling back to HuggingFace...');
        return await parseWithHuggingFace(text);
      } catch (hfError: unknown) {
        console.error('HuggingFace error:', hfError);
        errors.push(`HuggingFace: ${hfError instanceof Error ? hfError.message : 'Unknown error'}`);
      }
    }
    
    // All services failed, provide a fallback
    console.error('All AI services failed with errors:', errors);
    
    // Return a basic template so the app doesn't crash
    return {
      name: 'Sample Name',
      title: 'Job Title',
      contact: {
        email: 'email@example.com',
        phone: '(123) 456-7890',
        location: 'City, State'
      },
      summary: 'Please add your professional summary here.',
      experience: [
        {
          company: 'Company Name',
          position: 'Position Title',
          duration: 'Start Date - End Date',
          description: 'Describe your responsibilities and achievements.'
        }
      ],
      education: [
        {
          school: 'University Name',
          degree: 'Degree',
          year: 'Graduation Year'
        }
      ],
      skills: ['Skill 1', 'Skill 2', 'Skill 3']
    };
  }
}