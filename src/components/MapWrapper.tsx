'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled (Leaflet requires window)
const EventMap = dynamic(() => import('@/components/EventMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

interface MapWrapperProps {
  latitude?: number;
  longitude?: number;
  eventTitle?: string;
}

export default function MapWrapper({ latitude, longitude, eventTitle }: MapWrapperProps) {
  return (
    <div className="h-[400px] w-full">
      <EventMap
        latitude={latitude}
        longitude={longitude}
        eventTitle={eventTitle}
      />
    </div>
  );
}
