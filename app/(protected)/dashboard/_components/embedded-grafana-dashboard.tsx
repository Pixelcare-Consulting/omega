'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface EmbeddedGrafanaDashboardProps {
  dashboardUrl: string;
  height?: string;
  title?: string;
}

export default function EmbeddedGrafanaDashboard({ 
  dashboardUrl, 
  height = '600px',
  title = 'Dashboard'
}: EmbeddedGrafanaDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        <iframe 
          src={dashboardUrl}
          width="100%" 
          height={height} 
          frameBorder="0"
          onLoad={handleIframeLoad}
          className="w-full"
          allow="fullscreen"
        />
      </CardContent>
    </Card>
  );
} 