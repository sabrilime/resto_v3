'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ArrowLeft, MapPin, Phone, Globe, Star } from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  rating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  specialities: Speciality[];
}

interface Speciality {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const SpecialityDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const specialityId = params.id as string;
  
  const [speciality, setSpeciality] = useState<Speciality | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialityAndRestaurants = async () => {
      try {
        // Fetch speciality details
        const specialityData = await api.specialities.getById(parseInt(specialityId));
        setSpeciality(specialityData);

        // Fetch restaurants with this speciality
        const restaurantsData = await api.restaurants.getBySpeciality(parseInt(specialityId));
        setRestaurants(restaurantsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (specialityId) {
      fetchSpecialityAndRestaurants();
    }
  }, [specialityId]);

  if (loading) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading restaurants...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!speciality) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Speciality not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{speciality.name}</h1>
          <p className="text-muted-foreground">
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Badge variant="secondary">{restaurants.length} restaurants</Badge>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">No restaurants found for this speciality</p>
            <p className="text-sm text-muted-foreground">
              Restaurants with this speciality will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                  {restaurant.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                    </div>
                  )}
                </div>
                {restaurant.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {restaurant.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{restaurant.address}</span>
                </div>
                
                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}

                {restaurant.specialities && restaurant.specialities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {restaurant.specialities.map((spec) => (
                      <Badge key={spec.id} variant="outline" className="text-xs">
                        {spec.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialityDetailPage; 