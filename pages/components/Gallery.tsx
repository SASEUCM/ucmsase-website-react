// components/Gallery.tsx
import { useState } from 'react';
import {
  View,
  Heading,
  Grid,
  Image,
  Text,
  Button,
  useTheme,
  ScrollView,
  Flex,
} from '@aws-amplify/ui-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

// Sample data - replace with your actual gallery items
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    title: 'Fall 2023 General Meeting',
    description: 'Members gathering for our first general meeting of the semester',
    imageUrl: 'gang.png',
    date: 'September 15, 2023'
  },
  {
    id: '2',
    title: 'Industry Network Night',
    description: 'Networking event with industry professionals',
    imageUrl: 'conferencepic.png',
    date: 'October 5, 2023'
  },
  {
    id: '3',
    title: 'Technical Workshop',
    description: 'Python programming workshop for beginners',
    imageUrl: 'golfcartpic.png',
    date: 'October 20, 2023'
  },
  {
    id: '4',
    title: 'Technical Workshop',
    description: 'Python programming workshop for beginners',
    imageUrl: 'standingonbusiness.png',
    date: 'October 20, 2023'
  },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const { tokens } = useTheme();

  return (
    <View
      borderRadius="medium"
      boxShadow="medium"
      backgroundColor="white"
      padding="2rem"
      maxWidth="1200px"
      margin="0 auto"
    >
      <Heading 
        level={2} 
        marginBottom={tokens.space.xl}
        color="#1A54C4"
      >
        Gallery
      </Heading>

      <Grid
        templateColumns={{ base: "1fr", medium: "1fr 1fr", large: "1fr 1fr 1fr" }}
        gap={tokens.space.xl}
      >
        {GALLERY_ITEMS.map((item) => (
          <View
            key={item.id}
            backgroundColor="white"
            borderRadius="20px"
            overflow="hidden"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            onClick={() => setSelectedImage(item)}
            style={{
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              cursor: 'pointer'
            }}
            className="gallery-item"
            padding="0"
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              objectFit="cover"
              width="100%"
              height="300px"
            />
          </View>
        ))}
      </Grid>

      {/* Image Detail View */}
      {/*
      {selectedImage && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0, 0, 0, 0.75)"
          alignItems="center"
          justifyContent="center"
          direction="row"
          style={{ 
            cursor: 'pointer',
            zIndex: 100 
          }}
          onClick={() => setSelectedImage(null)}
        >
          <View
            backgroundColor="white"
            borderRadius="20px"
            maxWidth="90%"
            maxHeight="90vh"
            onClick={(e) => e.stopPropagation()}
            boxShadow="0 10px 25px rgba(0, 0, 0, 0.2)"
            overflow="hidden"
            style={{ cursor: 'default' }}
          >
            <ScrollView height="90vh">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                width="100%"
                maxHeight="70vh"
                objectFit="contain"
              />
              <View padding={tokens.space.large}>
                <Heading level={3} marginBottom={tokens.space.small}>
                  {selectedImage.title}
                </Heading>
                <Text marginBottom={tokens.space.medium}>
                  {selectedImage.description}
                </Text>
                <Flex justifyContent="flex-end">
                  <Button
                    onClick={() => setSelectedImage(null)}
                    className="blue-button"
                  >
                    Close
                  </Button>
                </Flex>
              </View>
            </ScrollView>
          </View>
        </Flex>
      )}
        */}

      <style jsx global>{`
        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </View>
  );
}