'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Karachi center coordinates
const KARACHI_CENTER: [number, number] = [24.8607, 67.0011];

interface EventMapProps {
  latitude?: number;
  longitude?: number;
  eventTitle?: string;
}

export default function EventMap({
  latitude,
  longitude,
  eventTitle = 'Event Location'
}: EventMapProps) {
  // Create icon inside component to avoid SSR issues
  // L.icon() requires window which isn't available during SSR
  const customIcon = useMemo(() => L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }), []);

  // Use provided coordinates or default to Karachi center
  const position: [number, number] = [
    latitude ?? KARACHI_CENTER[0],
    longitude ?? KARACHI_CENTER[1],
  ];

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={customIcon}>
        <Popup>{eventTitle}</Popup>
      </Marker>
    </MapContainer>
  );
}
