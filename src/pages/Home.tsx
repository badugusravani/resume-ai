import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCredits } from '../contexts/CreditContext';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { totalCredits, addCredits } = useCredits();

  const handleAddCredits = () => {
    addCredits(1000, 30); // Add 1000 credits valid for 30 days
    toast.success('Added 1000 credits to your account!');
  };

  return (
    <>
      <Helmet>
        <title>ResumeAI - AI-Powered Resume Builder</title>
        <meta
          name="description"
          content="Create professional resumes with AI. Optimize for ATS, generate cover letters, and get hired faster with ResumeAI."
        />
      </Helmet>

      <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 text-white p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Create Professional Resumes with AI</h1>
        <p className="text-xl mb-6">Transform your career with our AI-powered resume builder.</p>
        <Link
          to="/resume-maker"
          className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold text-lg"
        >
          Create Your Resume
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Start Building for Free</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold">Credits</h3>
              <p className="text-gray-600">Current credits: {totalCredits}</p>
            </div>
          </div>
          
          <button
            onClick={handleAddCredits}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            + Add 1000 Credits
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;