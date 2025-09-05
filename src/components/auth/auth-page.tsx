'use client';

import { useState } from 'react';
import { PhoneInput } from './phone-input';
import { VerificationInput } from './verification-input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type AuthStep = 'phone' | 'verification';
type AuthMode = 'login' | 'register';

export function AuthPage() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState('');
  const [currentVerificationCode, setCurrentVerificationCode] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handlePhoneSubmit = async (phone: string, name?: string) => {
    setIsLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { phoneNumber: phone }
        : { phoneNumber: phone, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setPhoneNumber(phone);
      setUserId(data.userId);
      setCurrentVerificationCode(data.verificationCode || '');
      setStep('verification');
      
      // Show verification code in development mode
      if (data.verificationCode) {
        toast({
          title: '🔐 Development Mode',
          description: `Your verification code is: ${data.verificationCode}`,
          duration: 10000, // Show for 10 seconds
        });
        console.log('🔐 Verification Code:', data.verificationCode);
      } else {
        toast({
          title: 'Code sent',
          description: 'Please check your phone for the verification code',
        });
      }
    } catch (error) {
      console.error('Phone submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send verification code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verificationCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Login successful
      login(data.token, data.user);
      
      toast({
        title: 'Success',
        description: 'You have been signed in successfully',
      });
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Invalid verification code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setUserId(data.userId);
      setCurrentVerificationCode(data.verificationCode || '');
      
      // Show verification code in development mode
      if (data.verificationCode) {
        toast({
          title: '🔐 Development Mode',
          description: `Your verification code is: ${data.verificationCode}`,
          duration: 10000, // Show for 10 seconds
        });
        console.log('🔐 Resend Verification Code:', data.verificationCode);
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend verification code',
      });
      throw error;
    }
  };

  const handleBack = () => {
    setStep('phone');
    setPhoneNumber('');
    setUserId('');
    setCurrentVerificationCode('');
  };

  const handleModeSwitch = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {step === 'phone' ? (
          <PhoneInput
            onSubmit={handlePhoneSubmit}
            isLoading={isLoading}
            mode={mode}
            onModeSwitch={handleModeSwitch}
          />
        ) : (
          <VerificationInput
            onSubmit={handleVerificationSubmit}
            onResend={handleResendCode}
            onBack={handleBack}
            isLoading={isLoading}
            phoneNumber={phoneNumber}
            verificationCode={currentVerificationCode}
          />
        )}
      </div>
    </div>
  );
}
