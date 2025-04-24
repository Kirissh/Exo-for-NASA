
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SpaceBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Create distant galaxies (simple version)
    const galaxyCount = 5;
    const galaxies = [];
    
    for (let i = 0; i < galaxyCount; i++) {
      const galaxyGeometry = new THREE.BufferGeometry();
      const galaxyMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(
          Math.random() * 0.3 + 0.7,  // More red
          Math.random() * 0.3 + 0.4,  // Less green
          Math.random() * 0.5 + 0.5   // Medium blue
        ),
        size: 0.15,
        transparent: true,
        opacity: 0.7
      });
      
      const galaxyVertices = [];
      const galaxySize = Math.random() * 50 + 30;
      const particleCount = 500;
      
      for (let j = 0; j < particleCount; j++) {
        // Create spiral galaxy pattern (simplified)
        const radius = Math.random() * galaxySize;
        const angle = Math.random() * Math.PI * 2;
        const xSpread = Math.random() * 5 - 2.5;
        const ySpread = Math.random() * 5 - 2.5;
        
        const x = Math.cos(angle) * radius + xSpread;
        const y = Math.sin(angle) * radius + ySpread;
        const z = (Math.random() - 0.5) * 10;
        
        galaxyVertices.push(x, y, z);
      }
      
      galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyVertices, 3));
      const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
      
      // Position galaxy far away
      galaxy.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000 - 500 // Push back
      );
      
      // Rotate galaxy
      galaxy.rotation.x = Math.random() * Math.PI;
      galaxy.rotation.y = Math.random() * Math.PI;
      
      scene.add(galaxy);
      galaxies.push(galaxy);
    }
    
    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const delta = (time - lastTime) * 0.001;
      lastTime = time;
      
      // Slowly rotate stars
      stars.rotation.x += 0.0001;
      stars.rotation.y += 0.0002;
      
      // Move camera slightly for parallax effect
      camera.position.x = Math.sin(time * 0.0001) * 0.5;
      camera.position.y = Math.cos(time * 0.0001) * 0.5;
      
      // Animate galaxies
      galaxies.forEach((galaxy, index) => {
        galaxy.rotation.y += 0.0005 * (index % 2 === 0 ? 1 : -1);
        galaxy.rotation.x += 0.0002 * (index % 3 === 0 ? 1 : -1);
      });
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      starsGeometry.dispose();
      starsMaterial.dispose();
      
      galaxies.forEach(galaxy => {
        (galaxy.geometry as THREE.BufferGeometry).dispose();
        (galaxy.material as THREE.PointsMaterial).dispose();
      });
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default SpaceBackground;
