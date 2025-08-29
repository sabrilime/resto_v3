'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressSearch } from '@/components/address-search';
import { api } from '@/lib/api';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

interface ApiAdresseFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    label: string;
    score: number;
    housenumber?: string;
    id: string;
    name: string;
    postcode: string;
    citycode: string;
    x: number;
    y: number;
    city: string;
    district?: string;
    context: string;
    type: string;
    importance: number;
    street?: string;
    house_number?: string;
    locality?: string;
    municipality?: string;
  };
}

interface Speciality {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface RestaurantFormData {
  name: string;
  description: string;
  instagram: string;
  halal: boolean;
  onlyDelivery: boolean;
  addressId?: number;
  specialityIds: number[];
}

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = Number(params.id);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<ApiAdresseFeature | null>(null);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    description: '',
    instagram: '',
    halal: false,
    onlyDelivery: false,
    specialityIds: [],
  });

  // Fetch restaurant data and specialities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant data
        const restaurant = await api.restaurants.getById(restaurantId);
        
        // Pre-populate form with existing data
        setFormData({
          name: restaurant.name || '',
          description: restaurant.description || '',
          instagram: restaurant.instagram || '',
          halal: restaurant.halal || false,
          onlyDelivery: restaurant.onlyDelivery || false,
          addressId: restaurant.addressId,
          specialityIds: restaurant.specialities?.map((s: any) => s.id) || [],
        });

        // Fetch specialities
        const specialitiesData = await api.specialities.getAll();
        setSpecialities(specialitiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant data');
        console.error('Error fetching restaurant data:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    if (restaurantId && !isNaN(restaurantId)) {
      fetchData();
    }
  }, [restaurantId]);

  const handleInputChange = (field: keyof RestaurantFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecialityToggle = (specialityId: number) => {
    setFormData(prev => ({
      ...prev,
      specialityIds: prev.specialityIds.includes(specialityId)
        ? prev.specialityIds.filter(id => id !== specialityId)
        : [...prev.specialityIds, specialityId]
    }));
  };

  const handleAddressSelect = async (address: ApiAdresseFeature) => {
    setSelectedAddress(address);
    
    try {
      // Create address in database
      const addressData = {
        house_number: address.properties.house_number || address.properties.housenumber || '',
        street: address.properties.street || address.properties.name,
        postal_code: address.properties.postcode,
        city: address.properties.city,
        insee_code: address.properties.citycode,
        latitude: address.geometry.coordinates[1],
        longitude: address.geometry.coordinates[0],
        onlyDelivery: formData.onlyDelivery,
      };

      console.log('[createFromFeature] Address data to save:', addressData);
      console.log('[createFromFeature] Coordinates:', address.geometry.coordinates);
      
      const savedAddress = await api.addresses.create(addressData);
      console.log('[createFromFeature] Saved address:', savedAddress);
      
      setFormData(prev => ({
        ...prev,
        addressId: savedAddress.id
      }));
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }

    if (!formData.addressId) {
      setError('Please select an address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        restaurantId: restaurantId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        instagram: formData.instagram.trim() || undefined,
        halal: formData.halal,
        onlyDelivery: formData.onlyDelivery,
        addressId: formData.addressId,
        specialityIds: formData.specialityIds,
      };

      const updatedRestaurant = await api.restaurants.update(restaurantId, payload);
      console.log('Restaurant updated:', updatedRestaurant);
      console.log('Updated restaurant address:', updatedRestaurant.address);
      console.log('Updated restaurant specialities:', updatedRestaurant.specialities);
      
      // Redirect to the updated restaurant page with cache-busting param
      router.push(`/restaurant/${updatedRestaurant.id}?updated=${Date.now()}`);
      // Force a hard refresh to ensure fresh data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update restaurant');
      console.error('Error updating restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading restaurant data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Restaurant</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Restaurant</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter restaurant name"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your restaurant..."
                rows={3}
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Handle</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@restaurant_name"
              />
            </div>

            {/* Halal Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="halal"
                checked={formData.halal}
                onCheckedChange={(checked) => handleInputChange('halal', checked as boolean)}
              />
              <Label htmlFor="halal">Halal Restaurant</Label>
            </div>

            {/* Only Delivery Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyDelivery"
                checked={formData.onlyDelivery}
                onCheckedChange={(checked) => handleInputChange('onlyDelivery', checked as boolean)}
              />
              <Label htmlFor="onlyDelivery">Delivery Only</Label>
            </div>

            {/* Address Search */}
            <div className="space-y-2">
              <Label>Address *</Label>
              <AddressSearch
                onAddressSelect={handleAddressSelect}
                placeholder="Search for restaurant address..."
              />
              {selectedAddress && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">Selected Address:</p>
                  <p>{selectedAddress.properties.label}</p>
                  {formData.addressId && (
                    <p className="text-green-600 text-xs mt-1">
                      ✓ Address saved to database
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Specialities Selection */}
            <div className="space-y-2">
              <Label>Specialities</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {specialities.map((speciality) => (
                  <div key={speciality.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`speciality-${speciality.id}`}
                      checked={formData.specialityIds.includes(speciality.id)}
                      onCheckedChange={() => handleSpecialityToggle(speciality.id)}
                    />
                    <Label 
                      htmlFor={`speciality-${speciality.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {speciality.name}
                    </Label>
                  </div>
                ))}
              </div>
              {specialities.length === 0 && (
                <p className="text-sm text-gray-500">Loading specialities...</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Restaurant'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
