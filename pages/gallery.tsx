// pages/gallery.tsx
import { View } from '@aws-amplify/ui-react';
import Gallery from './components/Gallery';

// pages/gallery.tsx
import SimplifiedGallery from './components/SimplifiedGallery';

export default function GalleryPage(): JSX.Element {
  return (
    <View
      as="main"
      backgroundColor="rgba(245, 245, 245, 0.7)"
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
          backgroundImage: 'url(/conferencepic.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: -1,
          transform: 'scale(1.1)' // Prevents blur edges from showing
        }}
      />
      <SimplifiedGallery />
    </View>
  );
}