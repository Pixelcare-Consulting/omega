import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentLayout } from '../_components/content-layout';

export default function DashboardLoading() {
  return (
    <ContentLayout title='Dashboard'>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

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

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
} 