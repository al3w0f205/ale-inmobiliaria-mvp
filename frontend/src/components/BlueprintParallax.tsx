"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function BlueprintParallax() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollY } = useScroll();

  // Subtle parallax translation (moves up slightly as we scroll down)
  const y1 = useTransform(scrollY, [0, 4000], [0, -400]);
  const y2 = useTransform(scrollY, [0, 4000], [200, -200]);
  const y3 = useTransform(scrollY, [0, 4000], [400, 0]);
  
  // Fade in and out based on absolute scroll pixels (reduced opacity for subtlety)
  const opacity1 = useTransform(scrollY, [0, 600, 1200], [0.35, 0.2, 0]);
  const opacity2 = useTransform(scrollY, [800, 1400, 2400, 3000], [0, 0.25, 0.25, 0]);
  const opacity3 = useTransform(scrollY, [2600, 3200, 4000], [0, 0.2, 0.35]);

  if (!isMounted) return null;

  // Mask image for smooth edge fading
  const maskStyle = { maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)' };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-hidden">
      {/* Blueprint 1 - Hero Section */}
      <motion.div 
        className="absolute top-[2vh] inset-x-0 h-[80vh] bg-center bg-no-repeat mix-blend-screen"
        style={{ 
          backgroundImage: 'url(/blueprint-house.png)',
          backgroundSize: 'cover',
          y: y1,
          opacity: opacity1,
          ...maskStyle
        }}
      />
      
      {/* Blueprint 2 - Middle Section */}
      <motion.div 
        className="absolute top-[10vh] inset-x-0 h-[80vh] bg-center bg-no-repeat mix-blend-screen"
        style={{ 
          backgroundImage: 'url(/blueprint-house-2.png)',
          backgroundSize: 'cover',
          y: y2,
          opacity: opacity2,
          ...maskStyle
        }}
      />
      
      {/* Blueprint 3 - Bottom Section */}
      <motion.div 
        className="absolute top-[20vh] inset-x-0 h-[80vh] bg-center bg-no-repeat mix-blend-screen"
        style={{ 
          backgroundImage: 'url(/blueprint-house-3.png)',
          backgroundSize: 'cover',
          y: y3,
          opacity: opacity3,
          ...maskStyle
        }}
      />
    </div>
  );
}
