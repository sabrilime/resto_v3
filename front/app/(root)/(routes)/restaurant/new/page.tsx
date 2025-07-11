'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
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
}

interface RestaurantFormData {
  name: string;
  description: string;
  image: string;
  instagram: string;
  halal: boolean;
  onlyDelivery: boolean;
  addressId?: number;
  specialityIds: number[];
}

export default function NewRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<ApiAdresseFeature | null>(null);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    description: '',
    image: '',
    instagram: '',
    halal: false,
    onlyDelivery: false,
    specialityIds: [],
  });

  

  // Fetch specialities on component mount
  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const data = await api.specialities.getAll();
        setSpecialities(data);
      } catch (err) {
        console.error('Error fetching specialities:', err);
      }
    };
    fetchSpecialities();
  }, []);

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
    setLoading(true);
    setError(null);

    try {
      // Create address in database from API Adresse feature data
      const createdAddress = await api.addresses.createFromFeature(address);
      setFormData(prev => ({
        ...prev,
        addressId: createdAddress.id,
        onlyDelivery: createdAddress.onlyDelivery || false
      }));
    } catch (err) {
      setError('Failed to save address. Please try again.');
      console.error('Error creating address:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }

    if (!selectedAddress) {
      setError('Please select an address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user id from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
        instagram: formData.instagram.trim() || undefined,
        halal: formData.halal,
        onlyDelivery: formData.onlyDelivery,
        addressId: formData.addressId,
        specialityIds: formData.specialityIds,
        postedByUserId: userId, // <-- from localStorage
      };

      const newRestaurant = await api.restaurants.create(payload);
      console.log('Restaurant created:', newRestaurant);
      
      // Redirect to the new restaurant page
      router.push(`/restaurant/${newRestaurant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant');
      console.error('Error creating restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Create New Restaurant</h1>
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

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
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
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !selectedAddress}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Restaurant...
                </>
              ) : (
                'Create Restaurant'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 