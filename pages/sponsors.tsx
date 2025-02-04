// pages/sponsors.tsx
import React from 'react';
import { View } from '@aws-amplify/ui-react';
import Sponsors from './components/Sponsors';

const SponsorsPage: React.FC = () => {
  return (
    <View
      as="main"
      borderRadius="medium"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      {/* Background image with blur */}
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/SaseBoard.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: -1,
          transform: 'scale(1.1)' // Prevents blur edges from showing
        }}
      />
      <Sponsors />
    </View>
  );
};

export default SponsorsPage;