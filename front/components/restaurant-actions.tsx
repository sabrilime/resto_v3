'use client';

import { Heart, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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

  const handleEdit = () => {
    if (onEdit) {
      onEdit(restaurantId);
    } else {
      // Default behavior: navigate to edit page
      router.push(`/restaurant/${restaurantId}/edit`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(restaurantId);
    } else {
      // Default behavior: show confirmation dialog
      if (confirm('Are you sure you want to delete this restaurant?')) {
        console.log('Delete restaurant:', restaurantId);
        // TODO: Implement delete API call
      }
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
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}; 