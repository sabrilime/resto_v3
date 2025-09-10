'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

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

interface AddressSearchProps {
  onAddressSelect?: (address: ApiAdresseFeature) => void;
  placeholder?: string;
  className?: string;
}

export const AddressSearch = ({ 
  onAddressSelect, 
  placeholder = "Search for an address...",
  className = ""
}: AddressSearchProps) => {
  const [query, setQuery] = useState('');
  const [addresses, setAddresses] = useState<ApiAdresseFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const skipNextSearchRef = useRef(false);

  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setAddresses([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await api.addresses.searchApiAdresse(searchQuery, 10);
      setAddresses(results);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!query) return;
      if (skipNextSearchRef.current) {
        // Skip the search triggered by selecting an item
        skipNextSearchRef.current = false;
        return;
      }
      searchAddresses(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleAddressSelect = (address: ApiAdresseFeature) => {
    // Prevent the subsequent effect from reopening results
    skipNextSearchRef.current = true;
    setQuery(address.properties.label);
    setShowResults(false);
    onAddressSelect?.(address);
  };

  const handleInputFocus = () => {
    if (addresses.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}

      {showResults && addresses.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {addresses.map((address) => (
              <div
                key={address.properties.id}
                onClick={() => handleAddressSelect(address)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {address.properties.house_number || address.properties.housenumber} {address.properties.street || address.properties.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {address.properties.postcode} {address.properties.city}
                    </div>
                    {address.geometry.coordinates && (
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {address.geometry.coordinates[1].toFixed(6)}, {address.geometry.coordinates[0].toFixed(6)}
                        </Badge>
                        {address.properties.citycode && (
                          <Badge variant="outline" className="text-xs">
                            INSEE: {address.properties.citycode}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showResults && addresses.length === 0 && !loading && query.length >= 3 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1">
          <CardContent className="p-4 text-center text-gray-500">
            Aucune adresse trouvée
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
