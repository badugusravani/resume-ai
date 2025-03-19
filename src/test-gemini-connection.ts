import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from './utils/env';
import { generateSampleLatexResume } from './lib/gemini';

// Get the API key from environment variables
const GEMINI_API_KEY = getEnv('VITE_GEMINI_API_KEY', 'AIzaSyClBAprRCqqFPs4a4Vfi_qqZsgceM4-Tqo');

async function testGeminiConnection() {
  console.log('Testing Gemini API connection...');
  console.log('API Key (first 5 chars):', GEMINI_API_KEY.substring(0, 5) + '...');
  
  try {
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Get the generative model
    console.log('Initializing Gemini model (gemini-pro)...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Simple prompt to test the connection
    console.log('Sending test request to Gemini API...');
    const result = await model.generateContent('Say hello world');
    
    // Get the response
    const response = await result.response;
    const text = response.text();
    
    console.log('Received response from Gemini API:');
    console.log(text);
    console.log('Connection test successful!');
    return true;
  } catch (error) {
    console.error('Error connecting to Gemini API:');
    console.error(error);
    return false;
  }
}

// Test the LaTeX resume generation
async function testLatexResumeGeneration() {
  console.log('Testing LaTeX resume generation with the specified template format...');
  
  try {
    const latexCode = await generateSampleLatexResume();
    console.log('LaTeX resume generated successfully:');
    console.log('\n------- GENERATED LATEX RESUME -------\n');
    console.log(latexCode);
    console.log('\n------- END OF LATEX RESUME -------\n');
    return true;
  } catch (error) {
    console.error('Error generating LaTeX resume:');
    console.error(error);
    return false;
  }
}

// Run the connection test first, then the LaTeX test
testGeminiConnection()
  .then(connectionSuccess => {
    if (connectionSuccess) {
      console.log('✅ Gemini API is working properly!');
      console.log('Now testing LaTeX resume generation...');
      
      return testLatexResumeGeneration();
    } else {
      console.log('❌ Failed to connect to Gemini API. Check your API key and network connection.');
      return false;
    }
  })
  .then(latexSuccess => {
    if (latexSuccess) {
      console.log('✅ LaTeX resume generation is working properly!');
    } else {
      console.log('❌ Failed to generate LaTeX resume. Check the error above.');
    }
  }); 