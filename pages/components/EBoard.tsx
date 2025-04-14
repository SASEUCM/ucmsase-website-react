// components/EBoard.tsx
import React, { useState } from 'react';
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
  description?: string; // Optional description for hover effect
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
        imageUrl: "/EvanLee.jpeg",
        description: "Description for Evan Lee",
      },
      {
        id: "2",
        name: "Srikar Gudipati",
        position: "Vice President",
        imageUrl: "/SrikarGudipati.jpeg",
        description: "Description for Srikar Gudipati",
      },
      {
        id: "3",
        name: "Naomi Baba",
        position: "Secretary",
        imageUrl: "/NaomiBaba.jpg",
        description: "Hi! I'm Naomi Baba and I'm a sophomore studying Civil Engineering. I currently serve as the Secretary for the UC Merced SASE chapter. Some of my interests include water resources, hydrology, and waste management. Feel free to reach out via email: nbaba@ucmerced.edu!",
      },
    ],
  },
  {
    title: "Finance & External Relations",
    members: [
      {
        id: "4",
        name: "Adit Khandelwal",
        position: "Treasurer",
        imageUrl: "/aditK.jpeg",
        description: "Description for Adit Khandelwal",
      },
      {
        id: "7",
        name: "Isaac Lara",
        position: "External",
        imageUrl: "/IsaacLara.jpeg",
        description: "Description for Isaac Lara",
      },
    ],
  },
  {
    title: "UI/UX Team",
    members: [
      {
        id: "5",
        name: "Deanna Nguyen",
        position: "UI/UX Designer",
        imageUrl: "/DeAnnaNguyen.jpeg",
        description: "Description for Deanna Nguyen",
      },
      {
        id: "6",
        name: "Aliza Ramos",
        position: "UI/UX Designer",
        imageUrl: "/AlizaRamos.jpeg",
        description: "Hello! My name is Liz and I'm a 3rd Year CSE Major with an Applied Math Minor. I'm currently the Co-UI/UX Chair for SASE, meaning I handle making the graphics we post! Some of my hobbies include collecting blind boxes and finding new music, and professionally my interests are in UI/UX and Marketing/Graphic Design :)",
      },
    ],
  },
  {
    title: "Technical Team",
    members: [
      {
        id: "8",
        name: "Addison Chen",
        position: "Webmaster",
        imageUrl: "/AddisonChen.jpeg",
        description: "Description for Addison Chen",
      },
      {
        id: "9",
        name: "Joshua Liu",
        position: "R&D Officer",
        imageUrl: "/JoshuaL.jpeg",
        description: "Description for Joshua Liu",
      },
    ],
  },
];

const EBoard: React.FC = () => {
  const { tokens } = useTheme();
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  return (
    <View
      borderRadius="medium"
      backgroundColor="white"
      padding={tokens.space.large.value} // Convert token to string
      maxWidth="1200px"
      margin="0 auto"
    >
      {BOARD_SECTIONS.map((section) => (
        <View key={section.title} marginBottom={tokens.space.xxl.value}>
          <Heading
            level={2}
            marginBottom={tokens.space.xl.value}
            color="#1A54C4"
          >
            {section.title}
          </Heading>

          <Grid
            templateColumns={{
              base: "1fr",
              medium: section.members.length === 1 ? "1fr" : "1fr 1fr",
              large:
                section.members.length === 1
                  ? "1fr"
                  : section.members.length === 2
                  ? "1fr 1fr"
                  : "1fr 1fr 1fr",
            }}
            gap={tokens.space.xl.value}
          >
            {section.members.map((member) => (
              <Card
                key={member.id}
                padding={tokens.space.large.value}
                borderRadius="medium"
                boxShadow="medium"
                variation="elevated"
                className="board-member-card"
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <View textAlign="center">
                  <View position="relative">
                    <Image
                      src={member.imageUrl}
                      alt={`${member.name}'s profile`}
                      width="150px"
                      height="150px"
                      objectFit="cover"
                      borderRadius="50%"
                      marginBottom={tokens.space.medium.value}
                    />
                    {hoveredMember === member.id && member.description && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', // White fade background
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: tokens.space.medium.value,
                        }}
                      >
                        <Text
                          color="black"
                          fontSize={
                            member.description.length > 100
                              ? tokens.fontSizes.small.value
                              : tokens.fontSizes.medium.value
                          }
                          textAlign="center"
                        >
                          {member.description}
                        </Text>
                      </View>
                    )}
                  </View>
                  {hoveredMember === member.id && (
                    <View
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', // White fade background
                        padding: tokens.space.small.value,
                        borderRadius: tokens.radii.small.value,
                        marginTop: tokens.space.small.value,
                      }}
                    >
                      <Heading
                        level={4}
                        color="#1A54C4"
                        marginBottom={tokens.space.xs.value}
                      >
                        {member.name}
                      </Heading>
                      <Text
                        color="gray"
                        fontSize={tokens.fontSizes.medium.value}
                      >
                        {member.position}
                      </Text>
                    </View>
                  )}
                  {hoveredMember !== member.id && (
                    <>
                      <Heading
                        level={4}
                        color="#1A54C4"
                        marginBottom={tokens.space.xs.value}
                      >
                        {member.name}
                      </Heading>
                      <Text
                        color="gray"
                        fontSize={tokens.fontSizes.medium.value}
                      >
                        {member.position}
                      </Text>
                    </>
                  )}
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