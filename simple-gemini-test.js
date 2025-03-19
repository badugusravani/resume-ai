// Simple test for Gemini API following Google's official examples
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// For text-only input, use the gemini-pro model
async function run() {
  console.log('Testing Gemini API with API key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = "Write a short story about a robot learning to love.";
    
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('\nAPI Response:');
    console.log(text);
    console.log('\nGemini API test completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    console.log('\nPlease check your API key and make sure it is valid.');
    console.log('You can get a new API key from https://makersuite.google.com/app/apikey');
  }
}

run();