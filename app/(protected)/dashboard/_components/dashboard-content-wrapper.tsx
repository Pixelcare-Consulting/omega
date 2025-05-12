'use client';

import React, { useState, useEffect } from 'react';
import { ExtendedUser } from '@/auth';
import DashboardContent from './dashboard-content';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface DashboardContentWrapperProps {
  user?: ExtendedUser;
}

export default function DashboardContentWrapper({ user }: DashboardContentWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Simulate loading state for smoother transition
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // If no user after loading, redirect to login
      if (!user && !isLoading) {
        console.error("Authentication error: No user data available");
        router.push('/login');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  if (!mounted) {
    return <DashboardContentSkeleton />;
  }

  if (isLoading) {
    return <DashboardContentSkeleton />;
  }

  // Extra check for user data
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load user data. Please try logging in again.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <DashboardContent user={user} />;
}

// Loading skeleton for the dashboard content
function DashboardContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome banner skeleton */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="mt-1 h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 