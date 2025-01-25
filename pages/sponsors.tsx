// pages/sponsors.tsx
import React from 'react';
import { View } from '@aws-amplify/ui-react';
import Sponsors from './components/Sponsors';

const SponsorsPage: React.FC = () => {
  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <Sponsors />
    </View>
  );
};

export default SponsorsPage;