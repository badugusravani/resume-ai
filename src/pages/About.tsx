import React from 'react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About - ResumeAI</title>
        <meta
          name="description"
          content="Learn about ResumeAI, the AI-powered resume builder that helps you create professional resumes and get hired faster."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About ResumeAI</h1>
          
          <div className="prose prose-lg">
            <p>
              ResumeAI is an advanced resume builder powered by artificial intelligence designed to help job seekers create professional,
              ATS-optimized resumes that get noticed by recruiters and hiring managers.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              Our mission is to democratize access to professional resume writing by leveraging cutting-edge AI technology.
              We believe everyone deserves the opportunity to present themselves effectively to potential employers,
              regardless of their background or writing skills.
            </p>
            
            <h2>The Technology</h2>
            <p>
              ResumeAI uses advanced large language models to analyze your resume content and provide tailored improvements.
              Our system can:
            </p>
            <ul>
              <li>Optimize your resume to pass through Applicant Tracking Systems (ATS)</li>
              <li>Generate impactful achievement bullets that highlight your accomplishments</li>
              <li>Create personalized cover letters tailored to specific job descriptions</li>
              <li>Format your resume professionally using elegant LaTeX templates</li>
            </ul>
            
            <h2>Our Values</h2>
            <p>
              <strong>Quality:</strong> We're committed to providing high-quality resume enhancements that truly improve your job prospects.
            </p>
            <p>
              <strong>Accessibility:</strong> We offer free credits to ensure everyone can experience the benefits of our AI-powered tools.
            </p>
            <p>
              <strong>Innovation:</strong> We continuously improve our AI models and features to deliver the best possible results.
            </p>
            
            <h2>Get Started</h2>
            <p>
              Ready to create a standout resume? Head to our Resume Maker and start building your professional resume today.
              With 1000 free credits, you can experience all the features ResumeAI has to offer.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;