'use client';

import { Heart, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface RestaurantActionsProps {
  restaurantId: number;
  postedByUserId?: number;
  onFavorite?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export const RestaurantActions = ({
  restaurantId,
  postedByUserId,
  onFavorite,
  onEdit,
  onDelete,
  className = ''
}: RestaurantActionsProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavouriting, setIsFavouriting] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user can edit/delete this restaurant
  const canEditDelete = user && (
    user.role === 'admin' || 
    (postedByUserId && user.id === postedByUserId)
  );

  // Function to refresh favourite status
  const refreshFavouriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsFavourited(false);
        console.log('Favourite status refreshed: false (no token)');
        return;
      }

      setIsAuthenticated(true);
      const favourited = await api.favourites.check(restaurantId);
      
      // Handle case where API returns null (due to content-type header issues)
      if (favourited === null) {
        console.log('Favourite status refreshed: false (null response)');
        setIsFavourited(false);
        return;
      }
      
      setIsFavourited(favourited);
      console.log('Favourite status refreshed:', favourited);
    } catch (error) {
      console.error('Error refreshing favourite status:', error);
      setIsFavourited(false);
      console.log('Favourite status refreshed: false (error)');
    }
  };

  // Check if restaurant is favourited on component mount
  useEffect(() => {
    refreshFavouriteStatus();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      refreshFavouriteStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [restaurantId, refreshFavouriteStatus]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(restaurantId);
    } else {
      // Default behavior: navigate to edit page
      router.push(`/restaurant/${restaurantId}/edit`);
    }
  };

  const handleFavorite = async () => {
    if (onFavorite) {
      onFavorite(restaurantId);
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add restaurants to your favourites.');
      return;
    }

    setIsFavouriting(true);
    
    try {
      if (isFavourited) {
        // Remove from favourites
        await api.favourites.deleteByRestaurant(restaurantId);
        setIsFavourited(false);
        console.log('Restaurant removed from favourites');
      } else {
        // Add to favourites
        await api.favourites.create({ restaurantId });
        setIsFavourited(true);
        console.log('Restaurant added to favourites');
      }
      
      // Refresh the favourite status to ensure consistency
      await refreshFavouriteStatus();
    } catch (error) {
      console.error('Error toggling favourite:', error);
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          alert('Please log in to manage your favourites.');
          setIsAuthenticated(false);
        } else if (error.message.includes('409')) {
          // Restaurant is already in favourites, update state
          console.log('Restaurant already in favourites, updating state');
          setIsFavourited(true);
        } else {
          alert('Failed to update favourites. Please try again.');
        }
      } else {
        alert('Failed to update favourites. Please try again.');
      }
    } finally {
      setIsFavouriting(false);
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
        className={`h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 ${
          isFavourited ? "text-red-500" : 
          isAuthenticated ? "text-gray-400" : "text-gray-300"
        }`}
        onClick={handleFavorite}
        disabled={isFavouriting}
        title={isAuthenticated ? "Add to favourites" : "Log in to add to favourites"}
      >
        {isFavouriting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFavourited ? "fill-current" : ""}`} />
        )}
      </Button>
      
      {/* Edit and Delete buttons - only show for admin or restaurant creator */}
      {canEditDelete && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            onClick={handleEdit}
            title="Edit restaurant"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete restaurant"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
    </div>
  );
}; 