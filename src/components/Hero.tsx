import React from 'react';

const Hero = () => {
  return (
    <div className="relative w-full overflow-x-hidden">
      {/* 1. Background Section - Karachi Vibe */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1623851502422-09436e4f31c5?q=80&w=2070&auto=format&fit=crop')",
            // Note: Aap apni pasand ki Karachi skyline image yahan replace kar sakte hain
          }}
        />
        {/* Vibrant Yellow-to-Orange gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24] to-[#ea580c] opacity-80" />

        {/* 2. Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-20 md:pb-12">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-3 md:mb-4 tracking-tight drop-shadow-lg font-['Playfair_Display',serif] max-w-[90%] md:max-w-none">
            Discover Pakistan's Vibrant Events
          </h1>
          <p className="text-base md:text-xl text-gray-200 max-w-[85%] md:max-w-2xl drop-shadow-md font-medium font-['Inter',sans-serif] pb-4">
            Your gateway to cultural festivals, tech meetups, concerts, and more across the nation.
          </p>
        </div>
      </div>

      {/* 3. Mobile Simple Search Bar */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm block md:hidden">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full shadow-lg flex items-center px-4 py-3">
          <svg className="text-gray-400 w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search Places"
            className="w-full bg-transparent focus:outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
      </div>

      {/* 4. Desktop Multi-Field Search Widget */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-auto min-w-[90%] max-w-4xl mx-auto overflow-hidden hidden md:block">
        <div className="bg-white p-8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-teal-200 backdrop-blur-md flex flex-row items-center gap-3 overflow-hidden">

          {/* Keyword Search */}
          <div className="flex items-center flex-1 px-4 border-r border-gray-100 dark:border-gray-800">
            <svg className="text-teal-500 w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Event keyword..."
              className="w-full bg-transparent py-2 focus:outline-none text-foreground"
            />
          </div>

          {/* Location Search */}
          <div className="flex items-center flex-1 px-4 border-r border-gray-100 dark:border-gray-800">
            <svg className="text-teal-500 w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Near town name..."
              className="w-full bg-transparent py-2 focus:outline-none text-foreground"
            />
          </div>

          {/* Date Search */}
          <div className="flex items-center flex-1 px-4">
            <svg className="text-teal-500 w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-400 text-sm">Any Date</span>
          </div>

          {/* Find Button */}
          <button className="bg-teal-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-600 transition-colors">
            Find Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;