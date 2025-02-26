import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const NavbarAnimation = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 60, 0.1, 1000);
    camera.position.z = 20;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, 60); // Height of navbar
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Position
      positions[i] = (Math.random() - 0.5) * window.innerWidth * 0.1;
      positions[i + 1] = (Math.random() - 0.5) * 60;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      // Velocity
      velocities[i] = (Math.random() - 0.5) * 0.1;
      velocities[i + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i + 2] = (Math.random() - 0.5) * 0.1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create material with custom gradient colors
    const particlesMaterial = new THREE.PointsMaterial({
      size: 2,
      color: 0x1A54C4, // SASE blue color
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);

      const positions = particlesGeometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        // Update positions based on velocities
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Wrap particles around when they go off screen
        if (positions[i] > window.innerWidth * 0.05) positions[i] = -window.innerWidth * 0.05;
        if (positions[i] < -window.innerWidth * 0.05) positions[i] = window.innerWidth * 0.05;
        if (positions[i + 1] > 30) positions[i + 1] = -30;
        if (positions[i + 1] < -30) positions[i + 1] = 30;
      }

      particlesGeometry.attributes.position.needsUpdate = true;

      // Rotate particles slightly
      particles.rotation.y += 0.0005;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / 60;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 60);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-16 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default NavbarAnimation;