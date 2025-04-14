import { View, Image, Text, Button, Heading, Flex, Card } from '@aws-amplify/ui-react';
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
  
  // Position details - could be expanded
  const positions = [
    {
      title: "President",
      description: "Lead the SASE organization and oversee all operations.",
      requirementsMarkdown: "- Must have served on SASE board for at least 1 year\n- Excellent leadership qualities\n- Strong communication skills",
      type: "SBOD"
    },
    {
      title: "Vice President",
      description: "Support the President and manage internal affairs of the organization.",
      requirementsMarkdown: "- Previous SASE board experience preferred\n- Ability to manage multiple projects\n- Strong organizational skills",
      type: "SBOD"
    },
    {
      title: "Treasurer",
      description: "Manage finances, budgeting, and reimbursements for the organization.",
      requirementsMarkdown: "- Experience with budgeting\n- Attention to detail\n- Basic accounting knowledge",
      type: "SBOD"
    },
    {
      title: "Secretary",
      description: "Keep records, take meeting minutes, and maintain documentation.",
      requirementsMarkdown: "- Strong organizational skills\n- Excellent written communication\n- Attention to detail",
      type: "SBOD"
    },
    {
      title: "Marketing Chair",
      description: "Manage social media and develop marketing strategies.",
      requirementsMarkdown: "- Experience with social media platforms\n- Creative content creation skills\n- Graphic design knowledge preferred",
      type: "Executive Chair"
    },
    {
      title: "Events Chair",
      description: "Plan and coordinate organization events and activities.",
      requirementsMarkdown: "- Event planning experience\n- Strong time management\n- Good communication skills",
      type: "Executive Chair"
    }
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
        <Card variation="elevated" marginBottom="2rem">
          <Heading level={3}>Election Timeline</Heading>
          <View as="ul" padding="1rem">
            <Text as="li" marginBottom="0.5rem">Applications Open: April 15th, 2025</Text>
            <Text as="li" marginBottom="0.5rem">Applications Close: April 29th, 2025</Text>
            <Text as="li" marginBottom="0.5rem">Candidate Presentations: May 3rd, 2025</Text>
            <Text as="li">Election Results: May 10th, 2025</Text>
          </View>
        </Card>


        {/* Positions Section */}
        <Heading level={2} textAlign="center" marginTop="3rem" marginBottom="1rem">
          Available Positions
        </Heading>

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
                    __html: position.requirementsMarkdown.replace(/\n/g, '<br />').replace(/- /g, '• ') 
                  }} 
                />
              </Card>
            ))
          }
        </Flex>

        {/* Executive Chair Positions */}
        <Heading level={3} marginTop="2rem">
          Executive Chair Positions
        </Heading>
        <Text marginBottom="1rem">
          Executive Chairs lead specific aspects of the organization and work closely with SBOD to implement the organization's vision.
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
                    __html: position.requirementsMarkdown.replace(/\n/g, '<br />').replace(/- /g, '• ') 
                  }} 
                />
              </Card>
            ))
          }
        </Flex>

        {/* FAQ Section */}
        <Heading level={2} textAlign="center" marginTop="3rem" marginBottom="1rem">
          Frequently Asked Questions
        </Heading>
        <Card variation="elevated">
          <View>
            <Heading level={4}>How do I apply?</Heading>
            <Text marginBottom="1rem">Click the "Apply Now" button to fill out our application form.</Text>
            
            <Heading level={4}>What is the time commitment?</Heading>
            <Text marginBottom="1rem">SBOD positions typically require 5-7 hours per week, while Executive Chair positions require 3-5 hours per week.</Text>
            
            <Heading level={4}>Who can apply?</Heading>
            <Text marginBottom="1rem">Any active SASE member enrolled at UCM can apply. Some positions have specific requirements as noted above.</Text>
            
            <Heading level={4}>How are elections conducted?</Heading>
            <Text>Candidates will present to the SASE general body, followed by a vote among active members.</Text>
          </View>
        </Card>

        {/* Apply Button - Again at Bottom */}
        <Flex justifyContent="center" marginY="2rem">
          <Button
            variation="primary"
            size="large"
            onClick={() => window.open(googleFormUrl, '_blank')}
          >
            Apply Now
          </Button>
        </Flex>
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