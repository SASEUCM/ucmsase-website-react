import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Group } from 'three';

const LoadingScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 5;

    // Load the GLTF model
    const loader = new GLTFLoader();
    let logo: Group | null = null;

    // Add a loading text element
    const loadingTextDiv = document.createElement('div');
    loadingTextDiv.style.position = 'absolute';
    loadingTextDiv.style.top = '70%';
    loadingTextDiv.style.left = '0';
    loadingTextDiv.style.width = '100%';
    loadingTextDiv.style.textAlign = 'center';
    loadingTextDiv.style.color = 'white';
    loadingTextDiv.style.fontSize = '24px';
    loadingTextDiv.style.fontFamily = 'Montserrat, sans-serif';
    loadingTextDiv.innerHTML = 'Loading SASE UC Merced...';
    containerRef.current.appendChild(loadingTextDiv);

    // Create loading progress indicator
    const progressBarContainer = document.createElement('div');
    progressBarContainer.style.position = 'absolute';
    progressBarContainer.style.top = '75%';
    progressBarContainer.style.left = '50%';
    progressBarContainer.style.transform = 'translateX(-50%)';
    progressBarContainer.style.width = '200px';
    progressBarContainer.style.height = '4px';
    progressBarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    progressBarContainer.style.borderRadius = '2px';
    containerRef.current.appendChild(progressBarContainer);

    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#1A54C4';
    progressBar.style.borderRadius = '2px';
    progressBar.style.transition = 'width 0.3s ease';
    progressBarContainer.appendChild(progressBar);

    loader.load(
      '/saselogo.gltf',
      (gltf) => {
        logo = gltf.scene;
        scene.add(logo);
        
        // Center the model
        const box = new THREE.Box3().setFromObject(logo);
        const center = box.getCenter(new THREE.Vector3());
        logo.position.sub(center);

        // Make it face the user and scale it up
        logo.rotation.x = Math.PI / 2;
        logo.scale.set(7, 7, 7);
        
        // Update loading text
        loadingTextDiv.innerHTML = 'SASE UC Merced';
        
        // Remove progress bar after loading
        setTimeout(() => {
          if (
            containerRef.current &&
            containerRef.current.contains(progressBarContainer)
          ) {
            containerRef.current.removeChild(progressBarContainer);
          }
        }, 500);
      },
      (progress) => {
        // Update progress bar
        const percent = (progress.loaded / progress.total) * 100;
        progressBar.style.width = `${percent}%`;
        console.log('Loading progress:', percent, '%');
      },
      (error) => {
        console.error('Error loading model:', error);
        loadingTextDiv.innerHTML = 'Error loading model. Please refresh.';
      }
    );

    // Add some particles for a better background effect
    const particles = new THREE.Group();
    scene.add(particles);
    
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Distribute particles in a spherical area
      posArray[i] = (Math.random() - 0.5) * 20;
      posArray[i + 1] = (Math.random() - 0.5) * 20;
      posArray[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x1A54C4,
      transparent: true,
      opacity: 0.8,
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particles.add(particleSystem);

    let time = 0;
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      if (logo) {
        // Keep the initial X rotation and add Z rotation for pinwheel effect
        logo.rotation.x = Math.PI / 2;  // Keep facing user
        logo.rotation.z = time;         // Spin like a pinwheel
      }
      
      // Animate particles
      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.0007;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        if (containerRef.current.contains(loadingTextDiv)) {
          containerRef.current.removeChild(loadingTextDiv);
        }
        if (containerRef.current.contains(progressBarContainer)) {
          containerRef.current.removeChild(progressBarContainer);
        }
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Dispose the model geometry & materials if loaded
      if (logo) {
        scene.remove(logo);
        logo.traverse((object) => {
          if ((object as THREE.Mesh).geometry) {
            (object as THREE.Mesh).geometry.dispose();
          }
          if ((object as THREE.Mesh).material) {
            const material = (object as THREE.Mesh).material;
            if (Array.isArray(material)) {
              material.forEach((mat) => mat.dispose());
            } else {
              material.dispose();
            }
          }
        });
      }
      
      // Clean up particle system
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-gradient-to-b from-blue-900 to-black"
    />
  );
};

export default LoadingScreen;
