"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Restaurant {
  id: number;
  name: string;
  rating?: number;
  address?: {
    street?: string;
    house_number?: string;
    postal_code?: string;
    city?: string;
  };
  specialities?: { id: number; name: string }[];
  image?: string;
}

const CityRestaurantsPage = () => {
  const router = useRouter();
  const params = useParams();
  const cityName = decodeURIComponent(params.cityName as string);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${API_URL}/restaurants/by-city/${encodeURIComponent(cityName)}`);
        if (!res.ok) throw new Error("Failed to fetch restaurants");
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (cityName) fetchRestaurants();
  }, [cityName]);

  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants à {cityName}</h1>
        <Badge variant="secondary">{restaurants.length} restaurants</Badge>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-lg">Chargement...</div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-lg text-red-500">Erreur: {error}</div>
      ) : restaurants.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-lg text-muted-foreground">Aucun restaurant trouvé dans cette ville.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/restaurant/${restaurant.id}`)}
            >
              <CardContent className="p-4 flex flex-col gap-2">
                {restaurant.image && (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-32 object-cover rounded mb-2 border"
                  />
                )}
                <CardTitle className="text-lg font-semibold mb-1">{restaurant.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {restaurant.address?.house_number || ''} {restaurant.address?.street || ''}, {restaurant.address?.postal_code || ''} {restaurant.address?.city || ''}
                  </span>
                </div>
                {restaurant.rating && (
                  <div className="flex items-center gap-1 text-yellow-500 text-sm mb-1">
                    <Star className="h-4 w-4" />
                    <span>{restaurant.rating}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {restaurant.specialities?.map((s) => (
                    <Badge key={s.id} variant="outline" className="text-xs">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityRestaurantsPage; 