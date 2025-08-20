'use client';

import { useState, useEffect } from 'react';
import { ChatLayout } from "@/components/chat-layout";
import { SplashScreen } from "@/components/splash-screen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center p-4 bg-background transition-colors duration-500">
      {isLoading ? <SplashScreen /> : <ChatLayout />}
    </main>
  );
}
