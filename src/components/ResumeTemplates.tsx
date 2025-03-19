import React from 'react';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // URL to preview image
  style: {
    fontFamily: string;
    primaryColor: string;
    secondaryColor: string;
    spacing: string;
    layout: 'classic' | 'modern' | 'minimal' | 'creative';
  };
}

const templates: ResumeTemplate[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional and clean design, perfect for conservative industries',
    preview: '/templates/classic.png',
    style: {
      fontFamily: 'Times New Roman, serif',
      primaryColor: '#2C3E50',
      secondaryColor: '#34495E',
      spacing: 'comfortable',
      layout: 'classic'
    }
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Contemporary design with clean lines and bold typography',
    preview: '/templates/modern.png',
    style: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      primaryColor: '#3498DB',
      secondaryColor: '#2980B9',
      spacing: 'compact',
      layout: 'modern'
    }
  },
  {
    id: 'creative',
    name: 'Creative Impact',
    description: 'Stand out with a unique layout and creative design elements',
    preview: '/templates/creative.png',
    style: {
      fontFamily: 'Roboto, sans-serif',
      primaryColor: '#E74C3C',
      secondaryColor: '#C0392B',
      spacing: 'dynamic',
      layout: 'creative'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal Elegance',
    description: 'Clean and minimalist design focusing on content',
    preview: '/templates/minimal.png',
    style: {
      fontFamily: 'Open Sans, sans-serif',
      primaryColor: '#1ABC9C',
      secondaryColor: '#16A085',
      spacing: 'minimal',
      layout: 'minimal'
    }
  }
];

interface ResumeTemplatesProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedTemplate === template.id
              ? 'border-indigo-600 shadow-lg'
              : 'border-gray-200 hover:border-indigo-400'
          }`}
          onClick={() => onSelectTemplate(template.id)}
        >
          <div className="aspect-w-3 aspect-h-4 mb-4">
            <img
              src={template.preview}
              alt={template.name}
              className="object-cover rounded"
            />
          </div>
          <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
          <p className="text-sm text-gray-600">{template.description}</p>
        </div>
      ))}
    </div>
  );
};

export { ResumeTemplates, templates }; 