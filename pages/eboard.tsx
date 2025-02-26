import React from 'react';
import { View } from '@aws-amplify/ui-react';
import EBoard from './components/EBoard';

const EBoardPage: React.FC = () => {
  return (
    <View
      as="main"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        fontFamily: "'Montserrat', sans-serif",
        textAlign: 'center',
        width: '100%',
      }}
      className="eboard-page"
    >
      {/* Background image with blur */}
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/standingonbusiness.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: -1,
          transform: 'scale(1.1)',
        }}
      />
      <EBoard />
    </View>
  );
};

export default EBoardPage;