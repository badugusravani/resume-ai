import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error("Error caught by boundary:", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          maxWidth: '800px', 
          margin: '40px auto', 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
            Something went wrong
          </h1>
          
          <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <p style={{ marginBottom: '20px' }}>
              We're sorry, but there was an error rendering this page.
              Our team has been notified and is working on a fix.
            </p>
            
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                marginRight: '10px'
              }}
            >
              Reload Page
            </button>
            
            <button 
              onClick={() => window.location.href = '/'} 
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 