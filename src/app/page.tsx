'use client';

import { useState, useEffect } from 'react';
import { ChatLayout } from "@/components/chat-layout";
import { SplashScreen } from "@/components/splash-screen";
import { AuthPage } from "@/components/auth/auth-page";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen during initial load
  if (isInitialLoading) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center p-4 bg-background transition-colors duration-500">
        <SplashScreen />
      </main>
    );
  }

  // Show loading during auth check
  if (authLoading) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center p-4 bg-background transition-colors duration-500">
        <SplashScreen />
      </main>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show chat app if authenticated
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center p-4 bg-background transition-colors duration-500">
      <ChatLayout />
    </main>
  );
}
