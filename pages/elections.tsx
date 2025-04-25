import { View, Image, Text, Button, Heading, Flex, Card, Divider } from '@aws-amplify/ui-react';
import { useRouter } from 'next/router';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

export default function ElectionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/about');
    }
  }, [isAuthenticated, router]);
  
  // Don't render anything while checking authentication or if not authenticated
  if (!isAuthenticated) return null;
  // URL for the Google Form
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfz5MkZv8MwopfWPoqds2wDPnuI16x0sgd0_7miefilUIWzQw/viewform?usp=header";
  const sbodFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSf2m0BzPjyMUa3e2mxY2Zkvk-BVC58KBkmGYcUJeevEU8UFmQ/viewform?usp=sharing";
  
  // Position details - could be expanded
  const positions = [
    {
      title: "President",
      description: "Lead the SASE organization and oversee all operations.",
      requirementsMarkdown: "- Must have served on SASE board for at least 1 year\n- Excellent leadership qualities\n- Strong communication skills",
      type: "Executive Chair"
    },
    {
      title: "Vice President",
      description: "Support the President and manage internal affairs of the organization.",
      requirementsMarkdown: "- Previous SASE board experience preferred\n- Ability to manage multiple projects\n- Strong organizational skills",
      type: "Executive Chair"
    },
    {
      title: "Co-Treasurer",
      description: "Manage finances, budgeting, and reimbursements for the organization.",
      requirementsMarkdown: "- Experience with budgeting\n- Attention to detail\n- Basic accounting knowledge",
      type: "Executive Chair"
    },
    {
      title: "Secretary",
      description: "Keep records, take meeting minutes, and maintain documentation.",
      requirementsMarkdown: "- Strong organizational skills\n- Excellent written communication\n- Attention to detail",
      type: "Executive Chair"
    },
    {
      title: "UI/UX Chair",
      description: "Manage social media and develop marketing strategies.",
      requirementsMarkdown: "- Experience with social media platforms\n- Creative content creation skills\n- Graphic design knowledge preferred",
      type: "SBOD"
    },
    {
      title: "Events Chair",
      description: "Plan and coordinate organization events and activities.",
      requirementsMarkdown: "- Event planning experience\n- Strong time management\n- Good communication skills",
      type: "Executive Chair"
    },
    {
      title: "Cultural Lead",
      description: "Plan cultural events and activities.",
      requirementsMarkdown: "- Event planning experience\n- Good Time Management skills\n- Good communication skills",
      type: "Executive Chair"
    },
    {
      title: "Engineering Lead",
      description: "Host engineering-related workshops and events.",
      requirementsMarkdown: "- Be able to attend Vanguard Meetings\n- Good technical skills\n- Strong communication skills",
      type: "Executive Chair"
    }
    // {
    //   title: "Natural Sciences Lead",
    //   description: "Host engineering-related workshops and events",
    //   requirementsMarkdown: "- Event planning experience\n- Strong time management\n- Good communication skills",
    //   type: "Executive Chair"
    // }
  ];

  return (
    <View
      as="main"
      backgroundColor="transparent"
      minHeight="100vh"
      padding="2rem"
    >
      {/* Main Content Container */}
      <View
        backgroundColor="white"
        borderRadius="medium"
        padding="2rem"
        boxShadow="medium"
        border="1px solid #e0e0e0"
      >
        <Heading level={1} textAlign="center" marginBottom="1rem">
          SASE Elections
        </Heading>
        
        <Text textAlign="center" marginBottom="2rem">
          Learn about SASE leadership positions and apply to make a difference in our organization.
          Elections for Student Board of Directors (SBOD) and Executive Chair positions open soon!
        </Text>

        {/* Timeline Section */}
        <Card variation="elevated" marginBottom="2rem" backgroundColor="#0a1930" padding="3rem">
          <Heading level={2} color="white" textAlign="center" marginBottom="3rem">
            Election Timeline
          </Heading>
          <View maxWidth="1000px" margin="0 auto">
            <Flex direction="row" alignItems="center" justifyContent="space-between">
              {[
                { date: 'April 15th, 2025', event: 'Applications Open', icon: '📝' },
                { date: 'April 29th, 2025', event: 'Applications Close', icon: '🔒' },
                { date: 'May 3rd, 2025', event: 'Presentations', icon: '🎤' },
                { date: 'May 10th, 2025', event: 'Results', icon: '🎉' },
              ].map((item, index, array) => (
                <View key={index} width="200px" position="relative">
                  <Flex direction="column" alignItems="center">
                    <View 
                      backgroundColor="#1a54c4" 
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Text fontSize="1.5rem">{item.icon}</Text>
                    </View>
                    <Text color="#1a54c4" fontSize="1.1rem" fontWeight="bold" textAlign="center" marginBottom="0.5rem">
                      {item.event}
                    </Text>
                    <Text color="white" fontSize="0.9rem" textAlign="center">
                      {item.date}
                    </Text>
                  </Flex>
                  {index < array.length - 1 && (
                    <View
                      backgroundColor="#1a54c4"
                      style={{
                        height: '2px',
                        position: 'absolute',
                        top: '30px',
                        left: '100%',
                        width: '100px',
                        transform: 'translateX(-50px)',
                        opacity: 0.5
                      }}
                    />
                  )}
                </View>
              ))}
            </Flex>
          </View>
        </Card>

        {/* Divider after Timeline */}
        <View 
          margin="3rem 0"
          style={{
            position: 'relative',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(26, 84, 196, 0) 0%, rgba(26, 84, 196, 0.4) 50%, rgba(26, 84, 196, 0) 100%)',
            boxShadow: '0 2px 4px -1px rgba(26, 84, 196, 0.1)',
          }}
        />

        {/* Positions Section */}
        <Heading level={2} textAlign="center" marginTop="3rem" marginBottom="1rem">
          Available Positions
        </Heading>

        {/* Executive Chair Positions */}
        <View>
          <Heading level={3} marginTop="2rem">
            Executive Chair Positions
          </Heading>
          <Text marginBottom="1rem">
            Executive Chairs lead specific aspects of the organization and work closely with SBOD to implement the organization&apos;s vision.
          </Text>
          <Flex direction={{ base: 'column', medium: 'row' }} wrap="wrap" gap="1rem">
            {positions
              .filter(position => position.type === "Executive Chair")
              .map((position, index) => (
                <Card 
                  key={index} 
                  variation="elevated"
                  width={{ base: '100%', medium: 'calc(50% - 1rem)' }} 
                  marginBottom="1rem"
                >
                  <Heading level={4}>{position.title}</Heading>
                  <Text>{position.description}</Text>
                  <Heading level={5} marginTop="1rem">Requirements:</Heading>
                  <Text as="div" 
                    dangerouslySetInnerHTML={{ 
                      __html: position.requirementsMarkdown.replace(/\n/g, '<br />').replace(/- /g, '&bull; ') 
                    }} 
                  />
                </Card>
              ))
            }
          </Flex>
        </View>

        {/* Apply Now Button */}
        <Flex justifyContent="center" margin="2rem 0">
          <Button
            variation="primary"
            size="large"
            onClick={() => window.open(googleFormUrl, '_blank')}
          >
            Apply Now
          </Button>
        </Flex>

        {/* SBOD Positions */}
        <Heading level={3} marginTop="2rem">
          Student Board of Directors (SBOD)
        </Heading>
        <Text marginBottom="1rem">
          SBOD members form the core leadership team of SASE and are responsible for the overall direction and management of the organization.
        </Text>
        <Flex direction={{ base: 'column', medium: 'row' }} wrap="wrap" gap="1rem">
          {positions
            .filter(position => position.type === "SBOD")
            .map((position, index) => (
              <Card 
                key={index} 
                variation="elevated"
                width={{ base: '100%', medium: 'calc(50% - 1rem)' }} 
                marginBottom="1rem"
              >
                <Heading level={4}>{position.title}</Heading>
                <Text>{position.description}</Text>
                <Heading level={5} marginTop="1rem">Requirements:</Heading>
                <Text as="div" 
                  dangerouslySetInnerHTML={{ 
                    __html: position.requirementsMarkdown.replace(/\n/g, '<br />').replace(/- /g, '&bull; ') 
                  }} 
                />
              </Card>
            ))
          }
        </Flex>

        {/* Apply Now Button for SBOD */}
        <Flex justifyContent="center" margin="2rem 0">
          <Button
            variation="primary"
            size="large"
            onClick={() => window.open(sbodFormUrl, '_blank')}
          >
            Apply Now
          </Button>
        </Flex>

        {/* Divider before FAQ */}
        <View 
          margin="3rem 0"
          style={{
            position: 'relative',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(26, 84, 196, 0) 0%, rgba(26, 84, 196, 0.4) 50%, rgba(26, 84, 196, 0) 100%)',
            boxShadow: '0 2px 4px -1px rgba(26, 84, 196, 0.1)',
          }}
        />

        {/* FAQ Section */}
        <Heading level={2} textAlign="center" marginTop="3rem" marginBottom="1rem">
          Frequently Asked Questions
        </Heading>
        <Card variation="elevated">
          <View>
            <Heading level={4}>How do I apply?</Heading>
            <Text marginBottom="1rem">Click the &quot;Apply Now&quot; button to fill out our application form.</Text>
            
            <Heading level={4}>What is the time commitment?</Heading>
            <Text marginBottom="1rem">Executive Chair positions typically require 5-7 hours per week, while SBOD positions require 3-5 hours per week.</Text>
            
            <Heading level={4}>Who can apply?</Heading>
            <Text marginBottom="1rem">Any active SASE member enrolled at UCM can apply. Some positions have specific requirements as noted above.</Text>
            
            <Heading level={4}>How are elections conducted?</Heading>
            <Text>Candidates will present to the SASE general body, followed by a vote among active members.</Text>
          </View>
        </Card>
      </View>

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
    </View>
  );
}