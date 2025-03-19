import React from 'react';
import { Layout, FileText, Briefcase } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    icon: <Layout className="h-8 w-8 text-blue-600" />,
    description: 'Clean and contemporary design with a focus on readability'
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: <Briefcase className="h-8 w-8 text-blue-600" />,
    description: 'Traditional format ideal for corporate and executive positions'
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: <FileText className="h-8 w-8 text-blue-600" />,
    description: 'Unique layout for design, marketing, and creative fields'
  }
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose a Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2">{template.icon}</div>
              <h3 className="font-medium text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;