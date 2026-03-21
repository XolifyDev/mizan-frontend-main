import React from 'react';

const CustomComponent = ({ slide, masjid, theme }) => {
  const defaultTheme = {
    background: '#550C18',
    text: '#FFFFFF',
    primary: '#78001A',
    accent: '#a32624',
    font: 'Arial, sans-serif'
  };

  const currentTheme = { ...defaultTheme, ...theme };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: currentTheme.background,
      color: currentTheme.text,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: currentTheme.font,
      textAlign: 'center'
    }}>
      <h1 style={{ 
        color: currentTheme.primary, 
        fontSize: '2.5rem', 
        marginBottom: '1rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        Custom Slide
      </h1>
      
      <div style={{ 
        fontSize: '1.2rem', 
        marginBottom: '2rem',
        opacity: 0.9
      }}>
        This is a custom component loaded from GitHub
      </div>
      
      <div style={{
        backgroundColor: currentTheme.accent,
        color: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        maxWidth: '500px'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Slide ID:</strong> {slide?.id || 'N/A'}<br/>
          <strong>Type:</strong> {slide?.type || 'N/A'}<br/>
          <strong>Masjid:</strong> {masjid?.name || 'N/A'}
        </div>
        
        {slide?.content && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Content:</strong><br/>
            <pre style={{ 
              textAlign: 'left', 
              fontSize: '0.8rem', 
              overflow: 'auto', 
              maxHeight: '100px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '8px',
              borderRadius: '4px'
            }}>
              {JSON.stringify(slide.content, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        fontSize: '0.9rem',
        opacity: 0.7,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '6px 10px',
        borderRadius: '4px'
      }}>
        Loaded at: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default CustomComponent; 