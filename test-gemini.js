// Simple test script for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use the API key directly for this test
const GEMINI_API_KEY = 'AIzaSyClBAprRCqqFPs4a4Vfi_qqZsgceM4-Tqo';

async function testModelNames() {
  console.log('Testing Gemini API with different model names...');
  console.log('API Key (first 5 chars):', GEMINI_API_KEY.substring(0, 5) + '...');
  
  // Initialize the API client
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  // List of model names to try
  const modelNames = [
    'gemini-pro',
    'gemini-1.0-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];
  
  for (const modelName of modelNames) {
    try {
      console.log(`\nTrying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      console.log('Sending test request...');
      const result = await model.generateContent('Say hello world');
      
      const response = await result.response;
      const text = response.text();
      
      console.log('Success! Received response:');
      console.log(text);
      console.log(`✅ Model ${modelName} works!`);
    } catch (error) {
      console.error(`Error with model ${modelName}:`);
      console.error(error.message);
      console.log(`❌ Model ${modelName} failed.`);
    }
  }
}

// Run the test
testModelNames().then(() => {
  console.log('\nTesting completed.');
});