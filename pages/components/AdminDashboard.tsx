// components/AdminDashboard.tsx
import React from 'react';
import {
  View,
  Heading,
  Grid,
  Card,
  Text,
  useTheme,
  Flex,
  Badge,
  Theme,
} from '@aws-amplify/ui-react';

interface StatCard {
  title: string;
  value: string;
  label: string;
  change?: string;
  color: string;
}

const STAT_CARDS: StatCard[] = [
  {
    title: "Total Members",
    value: "156",
    label: "👥",
    change: "+12% from last month",
    color: "#1A54C4"
  },
  {
    title: "Upcoming Events",
    value: "8",
    label: "📅",
    change: "Next event in 3 days",
    color: "#16a34a"
  },
  {
    title: "Gallery Items",
    value: "45",
    label: "🖼️",
    change: "Last updated 2 days ago",
    color: "#9333ea"
  },
  {
    title: "Contact Messages",
    value: "23",
    label: "📧",
    change: "5 unread messages",
    color: "#dc2626"
  }
];

interface QuickAction {
  title: string;
  description: string;
  label: string;
  path: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Add New Event",
    description: "Schedule and publish a new event",
    label: "📅",
    path: "/admin/events/new"
  },
  {
    title: "Manage Members",
    description: "Add or edit member information",
    label: "👥",
    path: "/admin/members"
  },
  {
    title: "Upload Photos",
    description: "Add new photos to the gallery",
    label: "🖼️",
    path: "/admin/gallery"
  },
  {
    title: "Site Settings",
    description: "Modify website configuration",
    label: "⚙️",
    path: "/admin/settings"
  }
];

const AdminDashboard: React.FC = () => {
  const { tokens } = useTheme();
  const activities = [
    "New member registration: John Doe",
    "Event updated: Technical Workshop",
    "New gallery photos uploaded",
    "Contact form submission received"
  ];

  return (
    <View padding="2rem">
      <Heading level={2} marginBottom={tokens.space.xl}>
        Dashboard Overview
      </Heading>

      {/* Stats Grid */}
      <Grid
        templateColumns={{ base: "1fr", medium: "1fr 1fr", large: "1fr 1fr 1fr 1fr" }}
        gap={tokens.space.medium}
        marginBottom={tokens.space.xl}
      >
        {STAT_CARDS.map((stat) => (
          <Card
            key={stat.title}
            padding={tokens.space.large}
            backgroundColor="white"
            borderRadius="medium"
            variation="elevated"
          >
            <Flex alignItems="center" marginBottom={tokens.space.small}>
              <View 
                backgroundColor={`${stat.color}15`}
                padding={tokens.space.small}
                borderRadius="medium"
                color={stat.color}
                marginRight={tokens.space.small}
                fontSize="1.5rem"
              >
                {stat.label}
              </View>
              <Text color="gray">{stat.title}</Text>
            </Flex>
            <Heading level={3} marginBottom={tokens.space.xs}>
              {stat.value}
            </Heading>
            <Text fontSize={tokens.fontSizes.small} color="gray">
              {stat.change}
            </Text>
          </Card>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Card
        padding={tokens.space.large}
        backgroundColor="white"
        borderRadius="medium"
        variation="elevated"
        marginBottom={tokens.space.xl}
      >
        <Flex alignItems="center" marginBottom={tokens.space.medium}>
          <Text fontSize="1.5rem" marginRight={tokens.space.small}>📊</Text>
          <Heading level={4}>
            Recent Activity
          </Heading>
        </Flex>
        <View>
          {activities.map((activity, index) => (
            <Flex
              key={index}
              padding={tokens.space.small}
              className={index !== activities.length - 1 ? 'activity-item-border' : ''}
              alignItems="center"
            >
              <Badge variation="success" marginRight={tokens.space.small}>
                New
              </Badge>
              <Text>{activity}</Text>
            </Flex>
          ))}
        </View>
      </Card>

      {/* Quick Actions */}
      <Heading level={4} marginBottom={tokens.space.medium}>
        Quick Actions
      </Heading>
      <Grid
        templateColumns={{ base: "1fr", medium: "1fr 1fr", large: "1fr 1fr 1fr 1fr" }}
        gap={tokens.space.medium}
      >
        {QUICK_ACTIONS.map((action) => (
          <Card
            key={action.title}
            padding={tokens.space.large}
            backgroundColor="white"
            borderRadius="medium"
            variation="elevated"
            className="quick-action-card"
          >
            <View 
              backgroundColor="#f3f4f6"
              padding={tokens.space.small}
              borderRadius="medium"
              marginBottom={tokens.space.small}
              width="fit-content"
              fontSize="1.5rem"
            >
              {action.label}
            </View>
            <Heading level={5} marginBottom={tokens.space.xs}>
              {action.title}
            </Heading>
            <Text fontSize={tokens.fontSizes.small} color="gray">
              {action.description}
            </Text>
          </Card>
        ))}
      </Grid>

      <style jsx global>{`
        .activity-item-border {
          border-bottom: 1px solid #eee;
        }

        .quick-action-card {
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        .quick-action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </View>
  );
};

export default AdminDashboard;