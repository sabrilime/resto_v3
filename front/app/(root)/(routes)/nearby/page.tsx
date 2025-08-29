"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";
import { api } from "@/lib/api";

type Coord = { lat: number; lng: number };

type Restaurant = {
  id: number;
  name: string;
  address?: {
    latitude?: number | string | null;
    longitude?: number | string | null;
  } | null;
  image?: string | null;
  rating?: number | null;
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Haversine distance in meters
function distanceMeters(a: Coord, b: Coord): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export default function NearbyPage() {
  const router = useRouter();
  const [position, setPosition] = useState<Coord | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Geolocate user and load restaurants
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // 1) Get user location
        const coords = await new Promise<Coord>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("La géolocalisation n'est pas supportée."));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(new Error(err.message || "Impossible d'obtenir la position.")),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        });
        if (cancelled) return;
        setPosition(coords);

        // 2) Fetch restaurants
        const all: Restaurant[] = await api.restaurants.getAll();
        if (cancelled) return;
        setRestaurants(all || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const inside1km = useMemo(() => {
    if (!position) return [] as Array<{ r: Restaurant; coord: Coord; dist: number }>;
    const result: Array<{ r: Restaurant; coord: Coord; dist: number }> = [];
    for (const r of restaurants) {
      const latRaw = r.address?.latitude;
      const lngRaw = r.address?.longitude;
      if (latRaw == null || lngRaw == null) continue;
      const lat = typeof latRaw === "string" ? parseFloat(latRaw) : Number(latRaw);
      const lng = typeof lngRaw === "string" ? parseFloat(lngRaw) : Number(lngRaw);
      if (!isFinite(lat) || !isFinite(lng)) continue;
      const coord = { lat, lng };
      const dist = distanceMeters(position, coord);
      if (dist <= 2000) result.push({ r, coord, dist });
    }
    // Sort by distance asc
    return result.sort((a, b) => a.dist - b.dist);
  }, [position, restaurants]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-6">
        <p className="text-red-500">La clé Google Maps n'est pas configurée.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">À proximité</h1>
        <span className="text-sm text-muted-foreground">
          {inside1km.length} restaurant{inside1km.length !== 1 ? "s" : ""} dans un rayon de 2 km
        </span>
      </div>

      <div className="w-full h-[360px] rounded-xl border overflow-hidden">
        {loading || !isLoaded ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-full text-red-500">{error}</div>
        ) : !position ? (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            Autorisez l'accès à la position pour voir la carte.
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={position}
            zoom={15}
            options={{ disableDefaultUI: true }}
          >
            {/* User position marker (blue) */}
            <Marker
              position={position}
              title="Votre position"
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />

            {/* 2km radius */}
            <Circle
              center={position}
              radius={2000}
              options={{
                fillColor: "#3b82f620",
                strokeColor: "#3b82f6",
                strokeOpacity: 0.8,
              }}
            />

            {/* Nearby restaurant markers */}
            {inside1km.map(({ r, coord }) => (
              <Marker
                key={r.id}
                position={coord}
                title={r.name}
                onClick={() => router.push(`/restaurant/${r.id}`)}
                icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
                label={
                  typeof r.rating === "number"
                    ? { text: String(r.rating), className: "font-semibold" }
                    : undefined
                }
              />
            ))}
          </GoogleMap>
        )}
      </div>

      {/* Simple list below the map */}
      {inside1km.length > 0 && (
        <div className="space-y-3">
          {inside1km.map(({ r, dist }) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
              onClick={() => router.push(`/restaurant/${r.id}`)}
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{(dist / 1000).toFixed(2)} km</div>
                </div>
              </div>
              {r.rating ? (
                <span className="text-sm font-semibold">{r.rating}</span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
