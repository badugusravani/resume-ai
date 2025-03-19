import React from 'react';

const FallbackPage = () => {
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
        Resume Builder
      </h1>
      
      <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <p style={{ marginBottom: '20px' }}>
          We're experiencing technical difficulties with our resume builder.
          Our team is working to resolve the issue as soon as possible.
        </p>
        
        <p style={{ marginBottom: '20px' }}>
          Please try refreshing the page or coming back later.
        </p>
        
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
};

export default FallbackPage; 