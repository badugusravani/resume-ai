import React, { useState, useRef, useEffect } from 'react';
import { useCredits } from '../contexts/CreditContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '../utils/env';
import { toast } from 'react-hot-toast';

// Initialize the Gemini API with the provided API key
const GEMINI_API_KEY = getEnv('VITE_GEMINI_API_KEY', 'AIzaSyClBAprRCqqFPs4a4Vfi_qqZsgceM4-Tqo');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ResumeCorrectionsProps {
  resumeLatex: string;
  onUpdateResume: (newLatex: string) => void;
}

const ResumeCorrectionsChat: React.FC<ResumeCorrectionsProps> = ({ resumeLatex, onUpdateResume }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'I can help you make corrections to your resume. What would you like to change or improve?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { useCredit } = useCredits();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check if free messages are available or if credits need to be used
      if (freeMessagesLeft > 0) {
        setFreeMessagesLeft(prev => prev - 1);
      } else {
        // Try to use 2 credits - call useCredit twice
        const firstCreditSuccess = await useCredit();
        if (!firstCreditSuccess) {
          throw new Error('Insufficient credits to continue chat. You need 2 credits per message after using your 3 free messages.');
        }
        
        const secondCreditSuccess = await useCredit();
        if (!secondCreditSuccess) {
          throw new Error('Insufficient credits to continue chat. You need 2 credits per message after using your 3 free messages.');
        }
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      // Create prompt with context and user request
      const prompt = `
        You are an expert resume writer. A user needs help with correcting and improving a LaTeX resume.
        
        The current LaTeX resume is:
        \`\`\`
        ${resumeLatex}
        \`\`\`
        
        The user is asking: "${inputMessage}"
        
        Requirements:
        1. Help fix any issues in the resume.
        2. Suggest improvements to make the resume more professional and effective.
        3. If you're going to modify the LaTeX code, provide the EXACT and COMPLETE updated code section.
        4. Be friendly and professional in your response.
        5. If changes are substantial, provide the complete updated LaTeX code.

        Your response format:
        - Start with a brief explanation of what you're changing
        - If you're modifying LaTeX, include a clear code block with the exact modified code
        - Conclude with any additional suggestions

        VERY IMPORTANT: If you need to provide the entire updated resume, start your code block with <<<FULL_RESUME_UPDATE>>> and end with <<<END_FULL_RESUME_UPDATE>>> so the system can identify it.
      `;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      // Check if AI is providing a full resume update
      if (aiResponse.includes('<<<FULL_RESUME_UPDATE>>>') && aiResponse.includes('<<<END_FULL_RESUME_UPDATE>>>')) {
        const startMarker = '<<<FULL_RESUME_UPDATE>>>';
        const endMarker = '<<<END_FULL_RESUME_UPDATE>>>';
        const startIndex = aiResponse.indexOf(startMarker) + startMarker.length;
        const endIndex = aiResponse.indexOf(endMarker);
        const newResumeLatex = aiResponse.substring(startIndex, endIndex).trim();
        
        // Update the resume
        onUpdateResume(newResumeLatex);
        
        // Modify the response to indicate the resume was updated
        const cleanedResponse = aiResponse
          .replace(startMarker, '')
          .replace(endMarker, '')
          .replace(newResumeLatex, '[Resume has been updated with these changes]');
          
        setMessages(prev => [...prev, { role: 'assistant', content: cleanedResponse }]);
      } else {
        // Just add the response to the chat
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      toast.error(errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${errorMessage}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 border border-gray-300 rounded-lg">
      <div className="bg-indigo-600 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">Resume Assistant</h3>
        <div className="text-xs bg-white text-indigo-600 rounded-full px-2 py-1">
          {freeMessagesLeft} free messages left
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${
              message.role === 'user' 
                ? 'ml-auto bg-indigo-100 rounded-lg p-3 max-w-3/4' 
                : 'mr-auto bg-white border border-gray-200 rounded-lg p-3 max-w-3/4'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex justify-center items-center mb-4">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-300 bg-white rounded-b-lg">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask for corrections or improvements..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || inputMessage.trim() === ''}
            className={`px-4 py-2 rounded-r-lg ${
              isLoading || inputMessage.trim() === ''
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {freeMessagesLeft > 0 ? 'Send' : 'Send (2 credits)'}
          </button>
        </div>
        {freeMessagesLeft === 0 && (
          <p className="text-xs text-gray-600 mt-1">
            You've used all free messages. Each additional message costs 2 credits.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeCorrectionsChat; 