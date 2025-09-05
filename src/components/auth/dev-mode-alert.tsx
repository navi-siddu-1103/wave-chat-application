'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DevModeAlertProps {
  verificationCode?: string;
  phoneNumber?: string;
}

export function DevModeAlert({ verificationCode, phoneNumber }: DevModeAlertProps) {
  const { toast } = useToast();

  if (!verificationCode) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    toast({
      title: 'Copied!',
      description: 'Verification code copied to clipboard',
    });
  };

  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
      <Info className="h-4 w-4" />
      <AlertTitle>Development Mode - SMS Simulation</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p>Since Twilio is not configured, your verification code is:</p>
          <div className="flex items-center space-x-2">
            <code className="bg-white dark:bg-gray-800 px-3 py-1 rounded text-lg font-mono font-bold">
              {verificationCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="h-8"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          {phoneNumber && (
            <p className="text-sm opacity-75">Sent to: {phoneNumber}</p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
