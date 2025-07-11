'use client';

import { Heart, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

interface RestaurantActionsProps {
  restaurantId: number;
  onFavorite?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export const RestaurantActions = ({
  restaurantId,
  onFavorite,
  onEdit,
  onDelete,
  className = ''
}: RestaurantActionsProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(restaurantId);
    } else {
      // Default behavior: navigate to edit page
      router.push(`/restaurant/${restaurantId}/edit`);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(restaurantId);
      return;
    }

    // Default behavior: show confirmation dialog
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await api.restaurants.delete(restaurantId);
      console.log('Restaurant deleted successfully', result);
      
      // Show success message and redirect to home page
      alert('Restaurant deleted successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        onClick={() => {
          if (onFavorite) {
            onFavorite(restaurantId);
          } else {
            console.log('Add to favorites:', restaurantId);
            // TODO: Implement favorites API call
          }
        }}
      >
        <Heart className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
        onClick={handleEdit}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}; 