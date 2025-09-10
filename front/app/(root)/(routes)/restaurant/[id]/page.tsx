"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { api } from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Instagram, MapPin, CheckCircle, Truck, Star, XCircle, ArrowLeft } from 'lucide-react';
import { RestaurantMap } from '@/components/restaurant-map';
import { RestaurantActions } from '@/components/restaurant-actions';
import { RestaurantComments } from '@/components/restaurant-comments';
import { RestaurantPhotos } from '@/components/restaurant-photos';

export default function RestaurantPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Number(params.id);
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (isNaN(id)) {
        setError("Invalid restaurant ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Add cache-busting parameter if coming from edit page
        const updated = searchParams.get('updated');
        const cacheBuster = updated ? `updated=${updated}` : '';
        const restaurantData = await api.restaurants.getById(id, cacheBuster);
        setRestaurant(restaurantData);
        console.log('Restaurant data:', restaurantData);
        console.log('Restaurant address:', restaurantData.address);
        console.log('Restaurant specialities:', restaurantData.specialities);
      } catch (err) {
        setError("Could not load restaurant information.");
        console.error('Error fetching restaurant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement du restaurant...</div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold mt-4">Restaurant Not Found</h1>
        <p className="text-red-500 mt-2">{error || "Could not load restaurant information."}</p>
      </div>
    );
  }

  // Parse coordinates with fallback to null if invalid
  const lat = restaurant.address?.latitude ? 
    (typeof restaurant.address.latitude === 'string' ? parseFloat(restaurant.address.latitude) : Number(restaurant.address.latitude)) : 
    null;
  const lng = restaurant.address?.longitude ? 
    (typeof restaurant.address.longitude === 'string' ? parseFloat(restaurant.address.longitude) : Number(restaurant.address.longitude)) : 
    null;
    
  // Validate coordinates
  const validLat = lat && !isNaN(lat) && lat >= -90 && lat <= 90 ? lat : null;
  const validLng = lng && !isNaN(lng) && lng >= -180 && lng <= 180 ? lng : null;
  
  console.log('Restaurant address:', restaurant.address);
  console.log('Raw coordinates - lat:', lat, 'lng:', lng);
  console.log('Validated coordinates - lat:', validLat, 'lng:', validLng);
  console.log('Lat type:', typeof validLat, 'Lng type:', typeof validLng);

  const addressObj = restaurant.address;
  const formattedAddress = addressObj
    ? `${addressObj.house_number || ''} ${addressObj.street || ''}, ${addressObj.postal_code || ''}, ${addressObj.city || ''}`.replace(/ +/g, ' ').replace(/, ,/g, ',').trim()
    : '';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <RestaurantActions restaurantId={restaurant.id} postedByUserId={restaurant.postedByUserId} />
      </div>
      
      {/* Photo Carousel Section */}
      <div className="mb-6">
        <RestaurantPhotos 
          restaurantId={restaurant.id} 
          restaurantName={restaurant.name}
          className="mb-4"
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Restaurant Image and Map */}
        <div className="flex flex-col gap-4 md:w-1/2">
          {restaurant.image && (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-48 object-cover rounded-lg border"
            />
          )}
          <div>
            <h2 className="font-semibold mb-2">Localisation</h2>
            <div className="flex gap-4 items-center">
              {validLat && validLng ? (
                <RestaurantMap lat={validLat} lng={validLng} label={restaurant.name} />
              ) : (
                <div className="flex items-center justify-center w-[250px] h-[180px] bg-gray-100 rounded-lg border">
                  <span className="text-gray-500 text-sm">No location available</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {formattedAddress || 'N/A'}
                  </a>
                </div>
                {restaurant.address?.city && (
                  <div className="flex items-center gap-2">
                    <span className="text-primary"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="currentColor"/></svg></span>
                    <span className="font-medium">{restaurant.address.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Right: Details */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
            {restaurant.instagram && (
              <a
                href={`https://instagram.com/${restaurant.instagram.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2"
                title="Instagram"
              >
                <Instagram className="h-6 w-6 text-pink-500" />
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {restaurant.specialities?.map((s: any) => (
              <Link key={s.id} href={`/specialities/${s.id}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:underline hover:bg-blue-100 transition"
                  title={`Voir la spécialité ${s.name}`}
                >
                  {s.name}
                </Badge>
              </Link>
            ))}
            {/* Delivery Only badge */}
            {restaurant.onlyDelivery ? (
              <Badge variant="outline" className="flex items-center gap-1 border-blue-400 text-blue-600">
                <Truck className="h-4 w-4" /> Delivery Only
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 border-gray-300 text-gray-500">
                <XCircle className="h-4 w-4" /> Delivery Only
              </Badge>
            )}
            {/* Halal badge */}
            {restaurant.halal ? (
              <Badge variant="outline" className="flex items-center gap-1 border-green-400 text-green-600">
                <CheckCircle className="h-4 w-4" /> Halal
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 border-gray-300 text-gray-500">
                <XCircle className="h-4 w-4" /> Halal
              </Badge>
            )}
          </div>
          {restaurant.description && (
            <div className="mb-2 text-gray-700 whitespace-pre-line">{restaurant.description}</div>
          )}
          {restaurant.rating && (
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-lg">{restaurant.rating}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="mt-8">
        <RestaurantComments restaurantId={restaurant.id} />
      </div>
    </div>
  );
} 
