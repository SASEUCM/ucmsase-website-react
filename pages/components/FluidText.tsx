import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface FluidTextProps {
  children: React.ReactNode;
  color?: string;
  fontSize?: string;
  as?: keyof JSX.IntrinsicElements;
}

const FluidText = ({ 
  children, 
  color = 'black',
  fontSize = '1rem',
  as = 'p' 
}: FluidTextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isHovered = useRef(false);

  // Spring configuration for smooth, fluid movement
  const springConfig = {
    damping: 25,
    stiffness: 200,
    mass: 0.5
  };

  // Create spring animations for x and y
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Add some tilt based on mouse position
  const rotateX = useTransform(springY, [-20, 20], [10, -10]);
  const rotateY = useTransform(springX, [-20, 20], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!ref.current || !isHovered.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      // Scale down the movement
      const scaleX = deltaX * 0.1;
      const scaleY = deltaY * 0.1;

      x.set(scaleX);
      y.set(scaleY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  const handleMouseEnter = () => {
    isHovered.current = true;
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
    // Reset position when mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        display: 'inline-block',
        perspective: '1000px',
        color,
        fontSize,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', ...springConfig }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          display: 'inline-block',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default FluidText;