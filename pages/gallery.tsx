// pages/gallery.tsx
import { View } from '@aws-amplify/ui-react';
import Gallery from './components/Gallery';

export default function GalleryPage() {
  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <Gallery />
    </View>
  );
}