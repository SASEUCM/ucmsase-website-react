import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface InteractiveImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

const InteractiveImage = ({ src, alt, onClick }: InteractiveImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      50, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 2;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 5);
    scene.add(directionalLight);

    // Add image plane
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // Null check for containerRef.current
      if (!containerRef.current) return;
      
      // Calculate aspect ratio to maintain image dimensions
      const imgAspect = texture.image.width / texture.image.height;
      const containerAspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      
      let width = 1.5;
      let height = 1.5 / imgAspect;
      
      if (containerAspect > imgAspect) {
        width = 1.5 * imgAspect / containerAspect;
        height = width / imgAspect;
      }
      
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.FrontSide,
        transparent: true,
      });
      
      const plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
      planeRef.current = plane;
      
      // Add subtle shadow plane
      const shadowGeometry = new THREE.PlaneGeometry(width * 1.05, height * 1.05);
      const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      
      const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadowPlane.position.z = -0.05;
      scene.add(shadowPlane);
      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        if (planeRef.current) {
          // Smooth rotation towards target
          currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
          currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;
          
          planeRef.current.rotation.x = currentRotation.current.x;
          planeRef.current.rotation.y = currentRotation.current.y;
          
          // Subtle floating animation when not hovering
          if (!isHovering) {
            const time = Date.now() * 0.001;
            planeRef.current.position.y = Math.sin(time * 0.5) * 0.03;
            shadowPlane.position.y = planeRef.current.position.y - 0.05;
          }
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
    });

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (planeRef.current) {
        planeRef.current.geometry.dispose();
        (planeRef.current.material as THREE.Material).dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [src]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate normalized mouse position (-1 to 1)
    mousePosition.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mousePosition.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    
    // Set target rotation (limit to small angles)
    targetRotation.current.y = mousePosition.current.x * 0.2;
    targetRotation.current.x = mousePosition.current.y * 0.2;
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    targetRotation.current.x = 0;
    targetRotation.current.y = 0;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      aria-label={alt}
    />
  );
};

export default InteractiveImage;