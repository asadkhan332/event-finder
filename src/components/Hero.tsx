'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Background Section - Premium Mesh Gradient */}
      <div className="relative w-full overflow-hidden">
        {/* Base gradient background - soft blue to purple */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #FAF5FF 50%, #F0F9FF 100%)',
          }}
        />

        {/* Animated Mesh Gradient Blobs */}
        {/* Blob 1 - Top Left - Light Blue */}
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 md:w-96 md:h-96 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.8) 0%, rgba(147, 197, 253, 0) 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Blob 2 - Top Right - Soft Purple */}
        <motion.div
          className="absolute -top-10 -right-20 w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.8) 0%, rgba(196, 181, 253, 0) 70%)',
            filter: 'blur(50px)',
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Blob 3 - Bottom Center - Light Pink/Purple Mix */}
        <motion.div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 md:w-[32rem] md:h-[32rem] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(216, 180, 254, 0.7) 0%, rgba(191, 219, 254, 0.4) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Blob 4 - Middle Left - Cyan Tint */}
        <motion.div
          className="absolute top-1/2 -left-16 w-64 h-64 md:w-80 md:h-80 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(165, 243, 252, 0.6) 0%, transparent 70%)',
            filter: 'blur(45px)',
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        {/* Subtle Grid Pattern Overlay - 5% opacity */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Hero Content - Centered with dark text for contrast */}
        <div className="relative flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
          <motion.h1
            className="text-4xl md:text-7xl font-bold text-slate-900 mb-4 md:mb-6 tracking-tight font-['Playfair_Display',serif] max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Discover Pakistan's Vibrant Events
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl text-slate-700 max-w-2xl font-medium font-['Inter',sans-serif]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            Your gateway to cultural festivals, tech meetups, concerts, and more across the nation.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
