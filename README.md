# ResumeAI - AI-Powered Resume Builder

ResumeAI is a modern web application that helps users create professional resumes with AI assistance. The application leverages large language models to enhance resume content, offering features like AI-powered enhancements, credit management, and multiple resume templates.

## Features

- **AI-Powered Resume Generation**: Create professional resumes with AI assistance
- **LaTeX Templates**: Choose from various professionally designed resume templates
- **Resume Corrections**: Chat interface to request specific changes to your resume
- **Credit System**: Purchase credits to use premium features
- **User Authentication**: Secure login and registration system
- **Admin Dashboard**: Manage credit packages and monitor user activity
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **State Management**: React Context API
- **Authentication**: Custom auth system (localStorage-based for demo)
- **Payment Integration**: Razorpay
- **AI Services**: Google Gemini API, OpenAI API (optional)
- **Testing**: Jest
- **Build Tool**: Vite

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- A Google Gemini API key (for AI features)

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/resume-ai.git
   cd resume-ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Admin Access

To access the admin dashboard:
1. Register a new account
2. Open browser console and run:
   ```javascript
   const users = JSON.parse(localStorage.getItem('users'));
   const userId = Object.keys(users)[0]; // Get first user ID
   users[userId].isAdmin = true;
   localStorage.setItem('users', JSON.stringify(users));
   ```
3. Refresh the page and you'll now see an Admin link in the navbar

## Payment Integration

The application uses Razorpay for payment processing:
- Test mode is enabled by default
- You can use any email and 4111 1111 1111 1111 as the card number for testing
- No real payments are processed in test mode

## Credit System

- New users get a limited number of free credits
- Additional credits can be purchased through the credit packages
- Credits expire after a set validity period
- Each resume generation or AI enhancement consumes credits

## Building for Production

To build the application for production:

```
npm run build
```

This will generate optimized files in the `dist` directory.

## Testing

Run the test suite with:

```
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TailwindCSS for the UI components
- Google Gemini API for AI capabilities
- React and Vite communities for the excellent development experience