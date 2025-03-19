import { describe, expect, test } from '@jest/globals';
import { optimizeResume, generateCoverLetter, generateAchievementBullets } from '../services/resumeService';
import type { ResumeData } from '../services/resumeService';
import { parseResume } from '../lib/openai';
import { enhanceResume } from '../lib/resume-enhancer';
import { parseResumeWithGemini } from '../lib/gemini';

const sampleResumeData: ResumeData = {
  personalInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    location: "New York, NY",
    summary: "Software engineer with 5 years of experience"
  },
  experience: [{
    title: "Software Engineer",
    company: "Tech Corp",
    location: "New York",
    duration: "2020-Present",
    description: "Developed web applications",
    achievements: ["Improved application performance"]
  }],
  education: [{
    degree: "BS Computer Science",
    institution: "University of Technology",
    year: "2019",
    location: "New York"
  }],
  skills: {
    technical: ["JavaScript", "React", "Node.js"],
    soft: ["Communication", "Leadership"]
  }
};

describe('Resume Service Tests', () => {
  test('Resume optimization should enhance content', async () => {
    const options = {
      targetRole: 'Senior Software Engineer',
      targetIndustry: 'Technology',
      experienceLevel: 'mid' as const,
      focusAreas: ['technical', 'achievements'] as Array<'technical' | 'achievements' | 'leadership' | 'metrics'>
    };

    const optimizedResume = await optimizeResume(sampleResumeData, 'auto', options);
    
    // Verify the optimized resume maintains structure
    expect(optimizedResume).toHaveProperty('personalInfo');
    expect(optimizedResume).toHaveProperty('experience');
    expect(optimizedResume).toHaveProperty('education');
    expect(optimizedResume).toHaveProperty('skills');
    
    // Verify content enhancement
    expect(optimizedResume.experience[0].achievements.length).toBeGreaterThan(0);
    expect(optimizedResume.skills.technical.length).toBeGreaterThan(0);
  });

  test('Cover letter generation should create relevant content', async () => {
    const jobDescription = "We are looking for a Senior Software Engineer with React experience";
    const companyName = "Tech Corp";

    const coverLetter = await generateCoverLetter(sampleResumeData, jobDescription, companyName);
    
    expect(coverLetter).toContain(sampleResumeData.personalInfo.name);
    expect(coverLetter).toContain(companyName);
    expect(coverLetter.length).toBeGreaterThan(200); // Minimum length check
  });

  test('Achievement bullet generation should create impactful points', async () => {
    const description = "Led development of web applications using React and Node.js";
    const role = "Software Engineer";

    const bullets = await generateAchievementBullets(description, role);
    
    expect(Array.isArray(bullets)).toBe(true);
    expect(bullets.length).toBeGreaterThan(0);
    bullets.forEach(bullet => {
      expect(bullet).toMatch(/^[A-Z]/); // Should start with capital letter
      expect(bullet).toMatch(/[.]/); // Should end with period
    });
  });
});

describe('Resume Creation Flow', () => {
  const testResume = `
John Doe
Software Engineer

Summary:
Experienced software engineer with 5 years of experience in web development.

Experience:
Senior Software Engineer | Tech Corp | 2020 - Present
- Led development of cloud-native applications
- Managed team of 5 developers
- Implemented CI/CD pipelines

Software Engineer | StartupCo | 2018 - 2020
- Developed React applications
- Improved site performance by 40%

Education:
BS in Computer Science | University of Technology | 2014 - 2018

Skills:
JavaScript, React, Node.js, Python, AWS, Docker
`;

  test('parseResume should extract information correctly', async () => {
    const result = await parseResume(testResume);
    expect(result).toHaveProperty('name', 'John Doe');
    expect(result).toHaveProperty('title', 'Software Engineer');
    expect(result.experience).toHaveLength(2);
    expect(result.skills).toContain('JavaScript');
  });

  test('parseResumeWithGemini should extract information correctly', async () => {
    const result = await parseResumeWithGemini(testResume);
    expect(result).toHaveProperty('name', 'John Doe');
    expect(result).toHaveProperty('title', 'Software Engineer');
    expect(result.experience).toHaveLength(2);
    expect(result.skills).toContain('JavaScript');
  });

  test('enhanceResume should provide improvements', async () => {
    const parsedResume = await parseResume(testResume);
    const enhanced = await enhanceResume(parsedResume);
    expect(enhanced).toHaveProperty('summary');
    expect(enhanced).toHaveProperty('experience');
    expect(enhanced).toHaveProperty('suggestions');
  });
}); 