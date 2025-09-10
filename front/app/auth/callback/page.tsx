'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Auth callback - token:', token);
    console.log('Auth callback - API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage');
      
      // Fetch user info using the token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('Fetching user info from:', `${apiUrl}/auth/me`);
      
      fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => {
          console.log('Profile response status:', res.status);
          if (!res.ok) {
            throw new Error(`Failed to fetch user info: ${res.status}`);
          }
          return res.json();
        })
        .then(user => {
          console.log('User data received:', user);
          localStorage.setItem('user', JSON.stringify(user));
          router.push('/');
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
          router.push('/sign-in');
        });
    } else {
      console.log('No token found in URL params');
      // No token found, redirect to sign-in
      router.push('/sign-in');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Finalisation de la connexion...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 
