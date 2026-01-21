import React from 'react';

const Hero = () => {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Background Section - Karachi Vibe */}
      <div className="relative w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1623851502422-09436e4f31c5?q=80&w=2070&auto=format&fit=crop')",
            // Note: Aap apni pasand ki Karachi skyline image yahan replace kar sakte hain
          }}
        />
        {/* Vibrant Yellow-to-Orange gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24] to-[#ea580c] opacity-80" />

        {/* Hero Content - Centered with increased font sizes */}
        <div className="relative flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-lg font-['Playfair_Display',serif] max-w-3xl">
            Discover Pakistan's Vibrant Events
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl drop-shadow-md font-medium font-['Inter',sans-serif]">
            Your gateway to cultural festivals, tech meetups, concerts, and more across the nation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;