'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface RestaurantMapProps {
  lat: number | null;
  lng: number | null;
  label?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function RestaurantMap({ lat, lng, label }: RestaurantMapProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured');
    return (
      <div className="flex items-center justify-center w-[250px] h-[180px] bg-gray-100 rounded-lg border">
        <span className="text-gray-500 text-sm">Map not available</span>
      </div>
    );
  }

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapContainerStyle = { width: '250px', height: '180px', borderRadius: '12px', border: '1px solid #eee' };

  // Check if we have valid coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return <div className="flex items-center justify-center w-[250px] h-[180px] bg-gray-100 rounded-lg border">No location</div>;
  }

  const mapCenter = { lat, lng };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={15}
      options={{ disableDefaultUI: true }}
    >
      <Marker 
        position={mapCenter} 
        label={label} 
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          scaledSize: new google.maps.Size(40, 40),
        }} 
      />
    </GoogleMap>
  ) : (
    <div className="flex items-center justify-center w-[250px] h-[180px] bg-gray-100 rounded-lg border">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
} 