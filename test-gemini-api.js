// Test script for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables or use the default one
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyClBAprRCqqFPs4a4Vfi_qqZsgceM4-Tqo';

console.log('Using API Key:', GEMINI_API_KEY.substring(0, 10) + '...');

// Initialize the Gemini API with explicit API version
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Simple prompt to test the API
    const prompt = 'Write a short paragraph about artificial intelligence.';
    
    // Generate content
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nAPI Response:');
    console.log(text);
    console.log('\nGemini API test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    return false;
  }
}

// Run the test
testGeminiAPI();