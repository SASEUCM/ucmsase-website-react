// components/EBoard.tsx
import React from 'react';
import {
  View,
  Heading,
  Grid,
  Card,
  Image,
  Text,
  useTheme,
} from '@aws-amplify/ui-react';

interface BoardMember {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
}

interface BoardSection {
  title: string;
  members: BoardMember[];
}

const BOARD_SECTIONS: BoardSection[] = [
  {
    title: "Executive Chairs",
    members: [
      {
        id: "1",
        name: "Evan Lee",
        position: "President",
        imageUrl: "/api/placeholder/200/200"
      },
      {
        id: "2",
        name: "Srikar Gudipati",
        position: "Vice President",
        imageUrl: "/api/placeholder/200/200"
      },
      {
        id: "3",
        name: "Naomi Baba",
        position: "Secretary",
        imageUrl: "/api/placeholder/200/200"
      }
    ]
  },
  {
    title: "Co-Treasurers",
    members: [
      {
        id: "4",
        name: "Harsh Patel",
        position: "Co-Treasurer",
        imageUrl: "/api/placeholder/200/200"
      },
      {
        id: "5",
        name: "Toby Jacob",
        position: "Co-Treasurer",
        imageUrl: "/api/placeholder/200/200"
      }
    ]
  }
];

const EBoard: React.FC = () => {
  const { tokens } = useTheme();

  return (
    <View
      backgroundColor="white"
      padding="2rem"
      maxWidth="1200px"
      margin="0 auto"
    >
      {BOARD_SECTIONS.map((section) => (
        <View key={section.title} marginBottom={tokens.space.xxl}>
          <Heading 
            level={2} 
            marginBottom={tokens.space.xl}
            color="#1A54C4"
          >
            {section.title}
          </Heading>

          <Grid
            templateColumns={{ base: "1fr", medium: "1fr 1fr", large: "1fr 1fr 1fr" }}
            gap={tokens.space.xl}
          >
            {section.members.map((member) => (
              <Card
                key={member.id}
                padding={tokens.space.large}
                borderRadius="medium"
                boxShadow="medium"
                variation="elevated"
                className="board-member-card"
              >
                <View textAlign="center">
                  <Image
                    src={member.imageUrl}
                    alt={`${member.name}'s profile`}
                    width="150px"
                    height="150px"
                    objectFit="cover"
                    borderRadius="50%"
                    marginBottom={tokens.space.medium}
                  />
                  <Heading 
                    level={4}
                    color="#1A54C4"
                    marginBottom={tokens.space.xs}
                  >
                    {member.name}
                  </Heading>
                  <Text
                    color="gray"
                    fontSize={tokens.fontSizes.medium}
                  >
                    {member.position}
                  </Text>
                </View>
              </Card>
            ))}
          </Grid>
        </View>
      ))}
    </View>
  );
};

export default EBoard;