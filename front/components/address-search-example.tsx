'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressSearch } from './address-search';

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

export const AddressSearchExample = () => {
  const [selectedAddress, setSelectedAddress] = useState<ApiAdresseFeature | null>(null);

  const handleAddressSelect = (address: ApiAdresseFeature) => {
    setSelectedAddress(address);
    console.log('Selected address:', address);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Address Search with La Poste API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddressSearch
            onAddressSelect={handleAddressSelect}
            placeholder="Enter a French address (e.g., 75001 Paris, Champs-Élysées)"
          />
          
          {selectedAddress && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Selected Address:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Street:</strong> {selectedAddress.properties.house_number || selectedAddress.properties.housenumber} {selectedAddress.properties.street || selectedAddress.properties.name}</p>
                <p><strong>City:</strong> {selectedAddress.properties.postcode} {selectedAddress.properties.city}</p>
                <p><strong>INSEE Code:</strong> {selectedAddress.properties.citycode}</p>
                {selectedAddress.geometry.coordinates && (
                  <p><strong>Coordinates:</strong> {selectedAddress.geometry.coordinates[1]}, {selectedAddress.geometry.coordinates[0]}</p>
                )}
                <p><strong>Full Address:</strong> {selectedAddress.properties.label}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 