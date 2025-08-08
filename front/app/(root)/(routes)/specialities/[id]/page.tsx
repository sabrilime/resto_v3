'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RestaurantActions } from '@/components/restaurant-actions';
import { api } from '@/lib/api';
import { ArrowLeft, MapPin, Star, Utensils, Users } from 'lucide-react';

interface Address {
  id: number;
  house_number?: string;
  street: string;
  postal_code: string;
  city: string;
  insee_code?: string;
  latitude?: number;
  longitude?: number;
  onlyDelivery: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: Address;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  specialities: Speciality[];
  postedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
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

  // Function to format address
  const formatAddress = (address: Address): string => {
    const parts = [];
    if (address.house_number) parts.push(address.house_number);
    if (address.street) parts.push(address.street);
    if (address.postal_code && address.city) {
      parts.push(`${address.postal_code} ${address.city}`);
    } else if (address.postal_code) {
      parts.push(address.postal_code);
    } else if (address.city) {
      parts.push(address.city);
    }
    return parts.join(', ');
  };

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
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-foreground">Loading restaurants...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-destructive">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!speciality) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-foreground">Speciality not found</div>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Utensils className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{speciality.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{restaurants.length} locations</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Top rated restaurants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant List */}
        {restaurants.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center shadow-sm border">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Utensils className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No restaurants found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No restaurants with this speciality have been added yet. Check back later or add a new restaurant.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant, index) => (
              <Card key={restaurant.id} className="bg-card shadow-sm border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Restaurant Number */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{index + 1}</span>
                          </div>
                        </div>
                        
                        {/* Restaurant Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 
                              className="text-xl font-semibold text-foreground hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors"
                              onClick={() => router.push(`/restaurant/${restaurant.id}`)}
                            >
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {restaurant.rating && (
                                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium text-green-700 dark:text-green-400">{restaurant.rating}</span>
                                </div>
                              )}
                              <RestaurantActions restaurantId={restaurant.id} postedByUserId={restaurant.postedBy?.id} />
                            </div>
                          </div>
                          
                          {/* Address */}
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground text-sm leading-relaxed">
                              {restaurant.address ? formatAddress(restaurant.address) : 'No address available'}
                            </span>
                          </div>
                          
                          {/* Specialities */}
                          {restaurant.specialities && restaurant.specialities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {restaurant.specialities.map((spec) => (
                                <Badge 
                                  key={spec.id} 
                                  variant="secondary" 
                                  className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                                >
                                  {spec.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Description */}
                          {restaurant.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                              {restaurant.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialityDetailPage; 