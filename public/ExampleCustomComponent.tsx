import React from 'react';

// Example of a custom component that can be loaded from a GitHub URL.
// This component receives `masjid` and `slides` as props.

interface Masjid {
  id: string;
  name: string;
  logo?: string;
  // Add other masjid properties as needed
}

interface Slide {
  id?: string;
  type: string;
  // Add other slide properties as needed
}

interface Theme {
  primary: string;
  background: string;
  text: string;
  accent: string;
  font?: string;
}

interface CustomComponentProps {
  slide: Slide;
  masjid?: Masjid;
  theme: Theme;
}

const CustomComponent: React.FC<CustomComponentProps> = ({ slide, masjid, theme }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: theme.background,
      color: theme.text,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: theme.font || 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: theme.primary, 
        fontSize: '2.5rem', 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Custom Slide
      </h1>
      
      <div style={{ 
        fontSize: '1.2rem', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        This is a custom component loaded from GitHub
      </div>
      
      <div style={{
        backgroundColor: theme.accent,
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <strong>Slide ID:</strong> {slide.id}<br/>
        <strong>Type:</strong> {slide.type}<br/>
        {masjid && <><strong>Masjid:</strong> {masjid.name}</>}
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        fontSize: '0.9rem',
        opacity: 0.7
      }}>
        Loaded at: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default CustomComponent; 