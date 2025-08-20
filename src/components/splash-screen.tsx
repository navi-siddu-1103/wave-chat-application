'use client';

import { MessageCircle } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex items-center text-primary animate-pulse">
        <MessageCircle className="w-20 h-20" />
        <h1 className="text-6xl font-bold ml-4">Wave</h1>
      </div>
      <p className="mt-4 text-muted-foreground">Loading your conversations...</p>
    </div>
  );
}
