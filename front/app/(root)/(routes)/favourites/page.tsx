'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RestaurantActions } from '@/components/restaurant-actions';
import { api } from '@/lib/api';
import { ArrowLeft, MapPin, Star, Heart, Users } from 'lucide-react';

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

interface Favourite {
  id: number;
  userId: number;
  restaurantId: number;
  createdAt: string;
  updatedAt: string;
  restaurant: Restaurant;
}

const FavouritesPage = () => {
  const router = useRouter();
  
  const [favourites, setFavourites] = useState<Favourite[]>([]);
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
    const fetchFavourites = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your favourites');
          setLoading(false);
          return;
        }

        // Fetch user's favourites
        const favouritesData = await api.favourites.getAll();
        setFavourites(favouritesData);
      } catch (err) {
        if (err instanceof Error && err.message.includes('401')) {
          setError('Please log in to view your favourites');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-foreground">Loading favourites...</div>
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
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Favourites</h1>
                <p className="text-muted-foreground mt-1">
                  {favourites.length} favourite{favourites.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{favourites.length} locations</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Your saved restaurants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant List */}
        {favourites.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center shadow-sm border">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No favourites yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You haven't added any restaurants to your favourites yet. Start exploring and add some restaurants you love!
              </p>
              <Button 
                onClick={() => router.push('/')}
                className="mt-4"
              >
                Explore Restaurants
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {favourites.map((favourite, index) => (
              <Card key={favourite.id} className="bg-card shadow-sm border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Restaurant Number */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">{index + 1}</span>
                          </div>
                        </div>
                        
                        {/* Restaurant Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 
                              className="text-xl font-semibold text-foreground hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                              onClick={() => router.push(`/restaurant/${favourite.restaurant.id}`)}
                            >
                              {favourite.restaurant.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {favourite.restaurant.rating && (
                                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium text-green-700 dark:text-green-400">{favourite.restaurant.rating}</span>
                                </div>
                              )}
                              <RestaurantActions restaurantId={favourite.restaurant.id} />
                            </div>
                          </div>
                          
                          {/* Address */}
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground text-sm leading-relaxed">
                              {favourite.restaurant.address ? formatAddress(favourite.restaurant.address) : 'No address available'}
                            </span>
                          </div>
                          
                          {/* Specialities */}
                          {favourite.restaurant.specialities && favourite.restaurant.specialities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {favourite.restaurant.specialities.map((spec) => (
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
                          {favourite.restaurant.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                              {favourite.restaurant.description}
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

export default FavouritesPage; 