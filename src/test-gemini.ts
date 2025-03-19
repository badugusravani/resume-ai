import { parseResumeWithGemini, enhanceResumeWithGemini, generateCoverLetterWithGemini } from './lib/gemini';

// Sample resume data for testing
const sampleResumeText = `
John Smith
Senior Software Engineer

Contact:
john.smith@example.com
(555) 123-4567
San Francisco, CA

Summary:
Experienced software engineer with 8 years of expertise in full-stack development, cloud architecture, and team leadership.

Experience:
Senior Software Engineer | TechCorp Inc. | 2020-Present
Led development of cloud-native applications using React, Node.js, and AWS services.

Software Engineer | InnovateSoft | 2016-2020
Developed and maintained web applications using JavaScript, Python, and various frameworks.

Education:
BS in Computer Science | University of Technology | 2012-2016

Skills:
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, CI/CD, Agile
`;

// Sample resume data object for enhancement testing
const sampleResumeData = {
  name: "John Smith",
  title: "Senior Software Engineer",
  summary: "Experienced software engineer with 8 years of expertise in full-stack development, cloud architecture, and team leadership.",
  experience: [
    {
      company: "TechCorp Inc.",
      position: "Senior Software Engineer",
      duration: "2020-Present",
      description: "Led development of cloud-native applications using React, Node.js, and AWS services."
    },
    {
      company: "InnovateSoft",
      position: "Software Engineer",
      duration: "2016-2020",
      description: "Developed and maintained web applications using JavaScript, Python, and various frameworks."
    }
  ],
  education: [
    {
      school: "University of Technology",
      degree: "BS in Computer Science",
      year: "2012-2016"
    }
  ],
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "CI/CD", "Agile"]
};

// Sample job description for cover letter testing
const sampleJobDescription = `
Senior Full Stack Developer

We are looking for an experienced Full Stack Developer to join our growing team. The ideal candidate will have strong experience with modern JavaScript frameworks, cloud services, and agile development practices.

Responsibilities:
- Develop and maintain web applications using React and Node.js
- Work with cloud services (AWS, Azure, or GCP)
- Collaborate with cross-functional teams
- Participate in code reviews and technical planning

Requirements:
- 5+ years of experience in software development
- Strong knowledge of JavaScript/TypeScript, React, and Node.js
- Experience with cloud services and containerization
- Bachelor's degree in Computer Science or related field
`;

// Test functions
async function testParseResume() {
  console.log('Testing parseResumeWithGemini...');
  try {
    const result = await parseResumeWithGemini(sampleResumeText);
    console.log('Parse Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Parse Error:', error);
  }
}

async function testEnhanceResume() {
  console.log('\nTesting enhanceResumeWithGemini...');
  try {
    const result = await enhanceResumeWithGemini(sampleResumeData);
    console.log('Enhancement Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Enhancement Error:', error);
  }
}

async function testGenerateCoverLetter() {
  console.log('\nTesting generateCoverLetterWithGemini...');
  try {
    const result = await generateCoverLetterWithGemini(sampleResumeData, sampleJobDescription);
    console.log('Cover Letter Result:', result);
    return result;
  } catch (error) {
    console.error('Cover Letter Error:', error);
  }
}

// Run all tests
async function runTests() {
  await testParseResume();
  await testEnhanceResume();
  await testGenerateCoverLetter();
  console.log('All tests completed!');
}

// Execute tests
runTests();