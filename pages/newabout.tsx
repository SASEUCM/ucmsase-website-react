import { View, Heading, Text, Button, Card, useTheme } from "@aws-amplify/ui-react";
import AnimatedBackground from "./components/AnimatedBackground";
import FluidText from "./components/FluidText";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface DraggableCardProps {
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  constraintsRef: React.RefObject<HTMLDivElement>;
  width?: string;
}

const DraggableCard = ({ 
  children, 
  initialX, 
  initialY, 
  constraintsRef, 
  width = "auto" 
}: DraggableCardProps) => {
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  
  const springConfig = { damping: 20, stiffness: 200 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const scale = useSpring(1, springConfig);
  const rotate = useSpring(0, springConfig);
  
  const onDragStart = () => {
    scale.set(1.1);
    rotate.set(5);
  };

  const onDragEnd = () => {
    scale.set(1);
    rotate.set(0);
  };

  return (
    <motion.div
      drag
      dragElastic={0.2}
      dragConstraints={constraintsRef}
      dragMomentum={true}
      style={{
        x: springX,
        y: springY,
        scale,
        rotate,
        cursor: "grab",
        position: "absolute",
        zIndex: 1,
        width,
      }}
      whileHover={{ scale: 1.05 }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  description: string;
  backgroundColor: string;
  initialX: number;
  initialY: number;
  constraintsRef: React.RefObject<HTMLDivElement>;
}

const StatCard = ({ 
  title, 
  description, 
  backgroundColor, 
  initialX, 
  initialY, 
  constraintsRef 
}: StatCardProps) => {
  return (
    <DraggableCard 
      initialX={initialX} 
      initialY={initialY} 
      constraintsRef={constraintsRef}
      width="300px"
    >
      <Card
        padding="2rem"
        backgroundColor={backgroundColor}
        borderRadius="medium"
        variation="elevated"
        style={{
          backdropFilter: "blur(10px)",
          cursor: "grab",
        }}
      >
        <FluidText color="white" fontSize="1.5rem">
          {title}
        </FluidText>
        <FluidText color="white">
          {description}
        </FluidText>
      </Card>
    </DraggableCard>
  );
};

export default function AboutPage() {
  const { tokens } = useTheme();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const mainCardX = windowDimensions.width * 0.1;
  const statsCardX = windowDimensions.width * 0.6;

  return (
    <View
      as="main"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <AnimatedBackground />

      <motion.div
        ref={constraintsRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          padding: "2rem",
        }}
      >
        {/* Main Content Card */}
        <DraggableCard 
          initialX={mainCardX} 
          initialY={100} 
          constraintsRef={constraintsRef}
          width="45%"
        >
          <Card
            padding={tokens.space.xl}
            backgroundColor="rgba(255, 255, 255, 0.9)"
            borderRadius="medium"
            variation="elevated"
            style={{
              backdropFilter: "blur(10px)",
            }}
          >
            <FluidText color="#1A54C4" fontSize="2rem">
              Welcome to SASE at UC Merced
            </FluidText>
            
            <FluidText
              color="black"
              fontSize="1.1rem"
            >
              The Society of Asian Scientists and Engineers (SASE) prepares Asian heritage students 
              for success in the global business world through professional development, 
              cultural awareness, and leadership opportunities.
            </FluidText>

            <Button
              variation="primary"
              size="large"
              onClick={() => window.location.href = '/contact'}
            >
              Join Us Today
            </Button>
          </Card>
        </DraggableCard>

        {/* Stat Cards */}
        <StatCard
          title="150+ Members"
          description="Growing community of future leaders and innovators"
          backgroundColor="rgba(26, 84, 196, 0.9)"
          initialX={statsCardX}
          initialY={100}
          constraintsRef={constraintsRef}
        />

        <StatCard
          title="25+ Events Yearly"
          description="Professional development workshops, social gatherings, and networking opportunities"
          backgroundColor="rgba(220, 38, 38, 0.9)"
          initialX={statsCardX}
          initialY={300}
          constraintsRef={constraintsRef}
        />

        <StatCard
          title="Industry Connections"
          description="Partnerships with leading tech companies and organizations"
          backgroundColor="rgba(37, 99, 235, 0.9)"
          initialX={statsCardX}
          initialY={500}
          constraintsRef={constraintsRef}
        />

        {/* Interactive Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          <FluidText color="white" fontSize="1.2rem">
            ✨ Try dragging the cards and hovering over the text! ✨
          </FluidText>
        </motion.div>
      </motion.div>
    </View>
  );
}