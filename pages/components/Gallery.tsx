import { View, Grid, Image } from '@aws-amplify/ui-react';

// Define interface for gallery items
interface GalleryItem {
  id: string;
  imageUrl: string;
}

// Gallery items
const GALLERY_ITEMS: GalleryItem[] = [
  { id: '1', imageUrl: '/gang.png' },
  { id: '2', imageUrl: '/conferencepic.png' },
  { id: '3', imageUrl: '/golfcartpic.png' },
  { id: '4', imageUrl: '/standingonbusiness.png' },
  { id: '5', imageUrl: '/mydog.png' },
  { id: '6', imageUrl: '/mydog.png' },
  { id: '7', imageUrl: '/mydog.png' },
  // The "mydog.png" are placeholders for future SASE pictures
];

export default function SimplifiedGallery(): JSX.Element {
  return (
    <View
      backgroundColor="rgba(255, 255, 255, 0.9)"
      borderRadius="medium"
      padding="2rem"
      boxShadow="medium"
    >
      <Grid
        templateColumns={{ base: "1fr", small: "1fr 1fr", medium: "1fr 1fr 1fr" }}
        gap="1.5rem"
      >
        {GALLERY_ITEMS.map((item) => (
          <View 
            key={item.id}
            borderRadius="8px"
            overflow="hidden"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
            className="gallery-image-wrapper"
          >
            <Image
              src={item.imageUrl}
              alt={`Gallery image ${item.id}`}
              width="100%"
              height="200px"
              objectFit="cover"
              className="gallery-image"
            />
          </View>
        ))}
      </Grid>

      <style jsx global>{`
        .gallery-image-wrapper {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .gallery-image-wrapper:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .gallery-image {
          transition: transform 0.5s ease;
        }
        
        .gallery-image-wrapper:hover .gallery-image {
          transform: scale(1.05);
        }
      `}</style>
    </View>
  );
}