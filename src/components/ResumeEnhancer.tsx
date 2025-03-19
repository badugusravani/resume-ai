import React, { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';

interface EnhancementSuggestion {
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  suggestions: string[];
}

interface ResumeEnhancerProps {
  originalData: any;
  enhancedData: EnhancementSuggestion;
  onApplySuggestion: (field: string, value: any) => void;
}

const ResumeEnhancer: React.FC<ResumeEnhancerProps> = ({ 
  originalData, 
  enhancedData, 
  onApplySuggestion 
}) => {
  const [showEnhancements, setShowEnhancements] = useState(true);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">AI Enhancement Suggestions</h2>
        </div>
        <button
          onClick={() => setShowEnhancements(!showEnhancements)}
          className="text-gray-500 hover:text-gray-700"
        >
          {showEnhancements ? 'Hide' : 'Show'}
        </button>
      </div>

      {showEnhancements && (
        <div className="space-y-6">
          {/* Summary Enhancement */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">Summary Enhancement</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onApplySuggestion('summary', enhancedData.summary)}
                  className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  title="Apply this suggestion"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button 
                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  title="Dismiss this suggestion"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-sm">
              <div className="bg-gray-50 p-2 mb-2 rounded">
                <p className="text-gray-500">Original:</p>
                <p>{originalData.summary}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-blue-600">Enhanced:</p>
                <p>{enhancedData.summary}</p>
              </div>
            </div>
          </div>

          {/* Experience Enhancements */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Experience Enhancements</h3>
            <div className="space-y-4">
              {enhancedData.experience.map((exp, index) => (
                <div key={index} className="border-t pt-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{exp.position} at {exp.company}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onApplySuggestion(`experience.${index}.description`, exp.description)}
                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        title="Apply this suggestion"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="Dismiss this suggestion"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="bg-gray-50 p-2 mb-2 rounded">
                      <p className="text-gray-500">Original:</p>
                      <p>{originalData.experience[index]?.description || 'No original description'}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-blue-600">Enhanced:</p>
                      <p>{exp.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Suggestions */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">General Suggestions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {enhancedData.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeEnhancer;