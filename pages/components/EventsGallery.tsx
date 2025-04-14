import { useState, useEffect } from 'react';
import { View, Heading, Text, Image } from '@aws-amplify/ui-react';
import { motion, AnimatePresence } from 'framer-motion';

// Upcoming Event (Replace imageUrl and signUpLink)
const upcomingEvent = {
  title: 'Litepoint Info Session',
  date: 'March 10, 2025',
  signUpLink: '#', // Replace with your link
  imageUrl: '/hackathon.png', // Replace with your flyer image URL
};

// Past Events (Replace imageUrl values)
const pastEvents = [
  {
    title: 'SASE x Intel',
    category: 'Professional Events',
    imageUrl: '/GraniteResume.png',
  },
  {
    title: 'Halloween Movie Night',
    category: 'Social Events',
    imageUrl: 'https://your-image-link-2.png',
  },
  {
    title: 'Multi-Org Beach Social',
    category: 'Collaboration Events',
    imageUrl: 'https://your-image-link-3.png',
  },
  {
    title: 'Third General Meeting',
    category: 'General Meetings',
    imageUrl: 'https://your-image-link-4.png',
  },
  // Add more events as needed
];

export default function EventsGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 4) % pastEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const visibleEvents = pastEvents.slice(currentIndex, currentIndex + 4);

  return (
    <View className="py-12 px-4 max-w-7xl mx-auto">
      {/* Page Title */}
      <Heading level={1} className="text-center text-4xl font-bold mb-4">
        Events
      </Heading>
      <Text className="text-center max-w-2xl mx-auto mb-12">
        Throughout the school year, UC Merced SASE hosts a variety of events. These events may be professional, social, or a mix of both! Stay up to date by following our Instagram or seeing our LIVE updates on Discord!
      </Text>

      {/* Upcoming Event Section */}
      <Heading level={2} className="text-2xl font-semibold mb-6 text-center">
        Upcoming Events
      </Heading>
      <View className="border-t border-gray-300 pt-6 mb-12 text-center">
        <Heading level={3} className="text-xl font-bold mb-2">
          {upcomingEvent.title}
        </Heading>
        <Text className="mb-2">{upcomingEvent.date}</Text>
        <a
          href={upcomingEvent.signUpLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline mb-4 block"
        >
          Sign up here!
        </a>
        <Image
          src={upcomingEvent.imageUrl}
          alt={upcomingEvent.title}
          className="mx-auto rounded-lg shadow-lg w-full max-w-md"
        />
      </View>

      {/* Past Events Gallery Section */}
      <Heading level={2} className="text-2xl font-semibold mb-6 text-center">
        Past Events
      </Heading>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {visibleEvents.map((event, index) => (
            <View
              key={index}
              className="flex flex-col items-center border rounded-lg shadow-lg p-4 bg-white"
            >
              <Image
                src={event.imageUrl}
                alt={event.title}
                className="rounded-lg mb-4 w-full object-cover h-64"
              />
              <Text className="font-bold text-center">
                {event.title}
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                {event.category}
              </Text>
            </View>
          ))}
        </motion.div>
      </AnimatePresence>
    </View>
  );
}
