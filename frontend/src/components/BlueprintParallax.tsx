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
  
  // Fade in and out based on absolute scroll pixels
  const opacity1 = useTransform(scrollY, [0, 600, 1200], [0.6, 0.4, 0]);
  const opacity2 = useTransform(scrollY, [800, 1400, 2400, 3000], [0, 0.4, 0.4, 0]);
  const opacity3 = useTransform(scrollY, [2600, 3200, 4000], [0, 0.3, 0.5]);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-hidden">
      {/* Blueprint 1 - Hero Section */}
      <motion.div 
        className="absolute top-[5vh] left-[5%] right-[5%] h-[70vh] bg-center bg-no-repeat mix-blend-screen"
        style={{ 
          backgroundImage: 'url(/blueprint-house.png)',
          backgroundSize: 'contain',
          y: y1,
          opacity: opacity1
        }}
      />
      
      {/* Blueprint 2 - Middle Section */}
      <motion.div 
        className="absolute top-[15vh] left-[5%] right-[5%] h-[70vh] bg-center bg-no-repeat mix-blend-screen"
        style={{ 
          backgroundImage: 'url(/blueprint-house-2.png)',
          backgroundSize: 'contain',
          y: y2,
          opacity: opacity2
        }}
      />
      
      {/* Blueprint 3 - Bottom Section */}
      <motion.div 
        className="absolute top-[25vh] left-[5%] right-[5%] h-[70vh] bg-center bg-no-repeat mix-blend-screen"
        style={{ 
          backgroundImage: 'url(/blueprint-house-3.png)',
          backgroundSize: 'contain',
          y: y3,
          opacity: opacity3
        }}
      />
    </div>
  );
}
