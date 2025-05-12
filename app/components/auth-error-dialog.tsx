'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { AlertCircle } from 'lucide-react';

interface AuthErrorDialogProps {
  message?: string;
  isOpen?: boolean;
}

export default function AuthErrorDialog({ message = 'Authentication error', isOpen = false }: AuthErrorDialogProps) {
  const [open, setOpen] = useState(isOpen);
  const router = useRouter();

  useEffect(() => {
    const handleAuthError = () => {
      setOpen(true);
    };

    // Add event listener for custom auth error event   
    window.addEventListener('auth-error', handleAuthError); 
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  const handleRetry = () => {
    setOpen(false);
    router.refresh();
  };

  const handleSignOut = () => {
    setOpen(false);
    router.push('/login');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Authentication Error
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            You were redirected to the dashboard, but there seems to be an authentication issue. 
            You may experience limited functionality.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleRetry}>
              Retry
            </Button>
            <Button variant="default" onClick={handleSignOut}>
              Sign In Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 