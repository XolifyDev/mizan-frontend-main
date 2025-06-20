import React from 'react';

// Example of a custom component that can be loaded from a GitHub URL.
// This component receives `masjid` and `slides` as props.

interface Masjid {
  id: string;
  name: string;
  // Add other masjid properties as needed
}

interface Slide {
  id?: string;
  type: string;
  // Add other slide properties as needed
}

interface CustomComponentProps {
  masjid?: any;
  theme?: any;
  [key: string]: any;
}

const ExampleCustomComponent: React.FC<CustomComponentProps> = ({ masjid, theme }) => {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: theme?.colors?.background || '#ffffff',
      color: theme?.colors?.text || '#000000',
      fontFamily: theme?.fonts?.body || 'Inter, sans-serif',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <h1 style={{
        color: theme?.colors?.primary || '#550C18',
        fontSize: '3rem',
        marginBottom: '1rem',
        fontFamily: theme?.fonts?.heading || 'Inter, sans-serif'
      }}>
        Welcome to {masjid?.name || 'Our Masjid'}
      </h1>
      
      <p style={{ 
        fontSize: '1.5rem', 
        marginBottom: '2rem',
        color: theme?.colors?.textSecondary || '#666666'
      }}>
        This is an example custom component for digital signage.
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem',
        maxWidth: '800px',
        margin: '2rem auto'
      }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: theme?.colors?.surface || '#f8f9fa',
          borderRadius: '0.75rem',
          border: `2px solid ${theme?.colors?.border || '#e9ecef'}`
        }}>
          <h3 style={{ 
            color: theme?.colors?.primary || '#550C18', 
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            Prayer Times
          </h3>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
            <p><strong>Fajr:</strong> 5:30 AM</p>
            <p><strong>Dhuhr:</strong> 1:30 PM</p>
            <p><strong>Asr:</strong> 4:45 PM</p>
            <p><strong>Maghrib:</strong> 7:15 PM</p>
            <p><strong>Isha:</strong> 8:45 PM</p>
          </div>
        </div>
        
        <div style={{
          padding: '1.5rem',
          backgroundColor: theme?.colors?.surface || '#f8f9fa',
          borderRadius: '0.75rem',
          border: `2px solid ${theme?.colors?.border || '#e9ecef'}`
        }}>
          <h3 style={{ 
            color: theme?.colors?.primary || '#550C18', 
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            Announcements
          </h3>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
            <p>📅 Friday prayer at 1:30 PM</p>
            <p>📚 Quran class every Sunday</p>
            <p>🕌 Community iftar this weekend</p>
            <p>🎓 Islamic studies for children</p>
          </div>
        </div>
      </div>
      
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        backgroundColor: theme?.colors?.accent || '#e3f2fd',
        borderRadius: '0.75rem',
        border: `2px solid ${theme?.colors?.border || '#bbdefb'}`,
        maxWidth: '600px',
        margin: '3rem auto 0'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: theme?.colors?.primary || '#550C18'
        }}>
          ✨ Custom component loaded successfully! ✨
        </p>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          fontSize: '0.9rem',
          color: theme?.colors?.textSecondary || '#666666'
        }}>
          This content is dynamically loaded from GitHub
        </p>
      </div>
    </div>
  );
};

export default ExampleCustomComponent; 