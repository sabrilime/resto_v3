"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PhotoCarousel } from "./photo-carousel";

interface Comment {
  id: number;
  image?: string;
}

interface RestaurantPhotosProps {
  restaurantId: number;
  restaurantName: string;
  className?: string;
}

export function RestaurantPhotos({ restaurantId, restaurantName, className = "" }: RestaurantPhotosProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const comments = await api.fetch(`/comments/restaurant/${restaurantId}`);
        
        // Extract images from comments
        const commentImages = comments
          .filter((comment: Comment) => comment.image)
          .map((comment: Comment) => {
            // Handle both relative and absolute URLs
            if (comment.image?.startsWith('http')) {
              return comment.image;
            } else if (comment.image) {
              return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${comment.image}`;
            }
            return null;
          })
          .filter(Boolean) as string[];

        setPhotos(commentImages);
      } catch (error) {
        console.error('Error fetching restaurant photos:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <PhotoCarousel 
      images={photos} 
      restaurantName={restaurantName} 
      className={className}
    />
  );
}
