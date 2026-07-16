// components/SimpleFooter.tsx
import { useState } from 'react';

const SimpleFooter = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <footer style={{
      textAlign: 'center',
      padding: '1.5rem',
      marginTop: '2rem',
      borderTop: '1px solid #eaeaea',
      color: '#666',
      fontSize: '0.9rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div 
        style={{
          transition: 'color 0.3s ease',
          cursor: 'default',
          color: isHovered ? '#000' : '#666'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
© {new Date().getFullYear()} Suhaan Patel. All rights reserved. <br/>
Wanna own one ?
 <br />
Contact +91 8424812140
      </div>
    </footer>
  );
};

export default SimpleFooter;