import { jest } from '@jest/globals';

// Mock environment variables
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-openai-key';

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
) as unknown as typeof fetch;

// Mock OpenAI
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockImplementation(() => Promise.resolve({
            choices: [{
              message: {
                content: JSON.stringify({
                  name: 'John Doe',
                  title: 'Software Engineer',
                  contact: {
                    email: 'john@example.com',
                    phone: '123-456-7890',
                    location: 'San Francisco, CA'
                  },
                  summary: 'Experienced software engineer',
                  experience: [{
                    company: 'Tech Corp',
                    position: 'Senior Software Engineer',
                    duration: '2020 - Present',
                    description: 'Led development'
                  }],
                  education: [{
                    school: 'University of Technology',
                    degree: 'BS in Computer Science',
                    year: '2014 - 2018'
                  }],
                  skills: ['JavaScript', 'React']
                })
              }
            }]
          }))
        }
      }
    }))
  };
});

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockImplementation(() => Promise.resolve({
          response: {
            text: () => JSON.stringify({
              name: 'John Doe',
              title: 'Software Engineer',
              contact: {
                email: 'john@example.com',
                phone: '123-456-7890',
                location: 'San Francisco, CA'
              },
              summary: 'Experienced software engineer',
              experience: [{
                company: 'Tech Corp',
                position: 'Senior Software Engineer',
                duration: '2020 - Present',
                description: 'Led development'
              }],
              education: [{
                school: 'University of Technology',
                degree: 'BS in Computer Science',
                year: '2014 - 2018'
              }],
              skills: ['JavaScript', 'React']
            })
          }
        }))
      })
    }))
  };
}); 