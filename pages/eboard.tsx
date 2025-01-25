// pages/eboard.tsx
import React from 'react';
import { View } from '@aws-amplify/ui-react';
import EBoard from './components/EBoard';

const EBoardPage: React.FC = () => {
  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <EBoard />
    </View>
  );
};

export default EBoardPage;