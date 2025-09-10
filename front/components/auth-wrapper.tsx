'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Routes that are allowed when not authenticated
const publicRoutes = ['/sign-in', '/sign-up', '/auth/callback'];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    console.log('AuthWrapper - pathname:', pathname, 'user:', !!user, 'loading:', loading);
    
    if (!loading) {
      // If user is not authenticated
      if (!user) {
        console.log('User not authenticated, checking if route is public:', publicRoutes.includes(pathname));
        // Only allow access to public routes
        if (!publicRoutes.includes(pathname)) {
          console.log('Redirecting to /sign-in from:', pathname);
          // Use window.location to force a full redirect
          window.location.href = '/sign-in';
        }
      } else {
        // If user is authenticated and trying to access auth routes, redirect to home
        // But allow if we're in the process of logging out
        if (publicRoutes.includes(pathname) && !isLoggingOut) {
          console.log('Authenticated user accessing auth route, redirecting to /');
          router.push('/');
        }
      }
    }
  }, [user, loading, pathname, router, isLoggingOut]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggingOut(true);
    };

    // Listen for storage changes (when token is removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue === null) {
        setIsLoggingOut(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 
