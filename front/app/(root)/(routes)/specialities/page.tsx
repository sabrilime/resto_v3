'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { 
  Coffee, 
  ChefHat, 
  Beef, 
  Utensils, 
  Globe, 
  Pizza, 
  MapPin, 
  Heart,
  Wine,
  Beer,
  Store
} from 'lucide-react';

interface Speciality {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const SpecialitiesPage = () => {
  const router = useRouter();
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icon mapping for specialities
  const getSpecialityIcon = (name: string) => {
    const iconMap: { [key: string]: any } = {
      'Boulangerie Patisserie': ChefHat,
      'Salon de Thé': Coffee,
      'Burger': Utensils,
      'Viandes': Beef,
      'Gastronomique': ChefHat,
      'Japonais': Globe,
      'Chinois': Globe,
      'Vietnamien': Globe,
      'Marocain': Globe,
      'Indien': Globe,
      'Fast Food': Utensils,
      'Italien': Pizza,
      'Cuisine du monde': Globe,
      'Pizza': Pizza,
      'Méditerranéen': Wine,
      'Poulet': Beef,
      'Brésilien': Globe,
      'Turc': Globe,
      'Tunisien': Globe,
      'Bar': Beer,
    };
    
    return iconMap[name] || Store; // Default icon
  };

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const data = await api.specialities.getAll();
        setSpecialities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialities();
  }, []);

  if (loading) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading specialities...</div>
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

  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Specialities</h1>
        <Badge variant="secondary">{specialities.length} specialities</Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {specialities.map((speciality) => {
          const IconComponent = getSpecialityIcon(speciality.name);
          return (
            <Card 
              key={speciality.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/specialities/${speciality.id}`)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium leading-tight">
                  {speciality.name}
                </CardTitle>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SpecialitiesPage; 