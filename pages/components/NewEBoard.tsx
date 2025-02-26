import React, { useState } from 'react';
import {
    View,
    Heading,
    Grid,
    Image,
    Text,
    useTheme,
} from '@aws-amplify/ui-react';

const MODERN_FONT = "'Montserrat', sans-serif";

interface BoardMember {
    id: string;
    name: string;
    position: string;
    imageUrl: string;
    description?: string;
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
                description: "Hi! I'm Naomi Baba and I'm a sophomore studying Civil Engineering. I currently serve as the Secretary for the UC Merced SASE chapter. Some of my interests include water resources, hydrology and waste management.",
            },
        ],
    },
    {
        title: "Co-Treasurers",
        members: [
            {
                id: "4",
                name: "Harsh Patel",
                position: "Co-Treasurer",
                imageUrl: "/api/placeholder/200/200",
                description: "Description for Harsh Patel",
            },
            {
                id: "5",
                name: "Toby Jacob",
                position: "Co-Treasurer",
                imageUrl: "/TobyJacob.jpeg",
                description: "Hi, my name is Toby Jacob and I am an Applied Mathematics major with an emphasis in Computer Science.",
            },
        ],
    },
    {
        title: "Co-Marketing",
        members: [
            {
                id: "6",
                name: "Deanna Nguyen",
                position: "Co-Marketing",
                imageUrl: "/DeAnnaNguyen.jpeg",
                description: "Description for Deanna Nguyen",
            },
            {
                id: "7",
                name: "Aliza Ramos",
                position: "Co-Marketing",
                imageUrl: "/AlizaRamos.jpeg",
                description: "Hello! My name is Liz and I’m a 3rd Year CSE Major with an Applied Math Minor.",
            },
        ],
    },
    {
        title: "Co-External",
        members: [
            {
                id: "8",
                name: "Isaac Lara",
                position: "Co-External",
                imageUrl: "/IsaacLara.jpeg",
                description: "Description for Isaac Lara",
            },
            {
                id: "9",
                name: "Nathan Cailles",
                imageUrl: "/NathanCailles.jpeg",
                position: "Co-External",
                description: "Description for Nathan Cailles",
            },
        ],
    },
    {
        title: "Webmaster",
        members: [
            {
                id: "10",
                name: "Addison Chen",
                position: "Webmaster",
                imageUrl: "/AddisonChen.jpeg",
                description: "Description for Webmaster",
            },
        ],
    },
];

const EBoard: React.FC = () => {
    const { tokens } = useTheme();
    const [hoveredMember, setHoveredMember] = useState<string | null>(null);

    return (
        <View
            className="p-8 rounded-md text-white eboard-container"
            style={{
                fontFamily: MODERN_FONT,
                borderRadius: tokens.radii.medium.value,
            }}
        >
            {BOARD_SECTIONS.map((section) => (
                <View
                    key={section.title}
                    marginBottom={tokens.space.xxl.value}
                    className="animate-fade-in"
                >
                    <Heading
                        level={2}
                        marginBottom={tokens.space.xl.value}
                        className="text-2xl font-semibold text-yellow-300"
                    >
                        {section.title}
                    </Heading>

                    <Grid
                        templateColumns={{
                            base: "1fr", // One column on small screens
                            medium: "1fr 1fr", // Two columns on medium screens
                            large: "1fr 1fr 1fr", // Three columns on large screens
                        }}
                        gap={tokens.space.xl.value}
                    >
                        {section.members.map((member) => (
                            <View
                                key={member.id}
                                className="group relative board-member-view transform transition-transform" // Removed hover:scale-105
                                onMouseEnter={() => setHoveredMember(member.id)}
                                onMouseLeave={() => setHoveredMember(null)}
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
                                            className="transition-opacity duration-500 group-hover:opacity-30" // Tailwind hover opacity
                                            style={{
                                            }}
                                        />
                                         {hoveredMember === member.id && member.description && (
                                            <View
                                                className="absolute top-0 left-0 right-0 bottom-0 rounded-full flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
                                                style={{
                                                    borderRadius: tokens.radii.xl.value,
                                                }}
                                            >
                                                <Text
                                                    color="white"
                                                    fontSize={
                                                        member.description.length > 100
                                                            ? tokens.fontSizes.small.value
                                                            : tokens.fontSizes.medium.value
                                                    }
                                                    textAlign="center"
                                                    className="font-light"
                                                >
                                                    {member.description}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                  <Heading
                                      level={4}
                                      className="font-semibold text-white"

                                  >
                                      {member.name}
                                  </Heading>
                                  <Text
                                      fontSize={tokens.fontSizes.medium.value}
                                      className = "text-gray-300"
                                  >
                                      {member.position}
                                  </Text>
                                </View>
                            </View>
                        ))}
                    </Grid>
                </View>
            ))}

            <style jsx global>{`
                  .board-member-view h4 {
                      color: white !important;
                  }
                  .board-member-view p {
                      color: gray-300 !important;
                  }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-in-out forwards;
                }

                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
      `}</style>
        </View>
    );
};

export default EBoard;