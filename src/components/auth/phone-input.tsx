'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhoneInputProps {
  onSubmit: (phoneNumber: string, name?: string) => Promise<void>;
  isLoading: boolean;
  mode: 'login' | 'register';
  onModeSwitch: () => void;
}

export function PhoneInput({ onSubmit, isLoading, mode, onModeSwitch }: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your phone number',
      });
      return;
    }

    if (mode === 'register' && !name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your name',
      });
      return;
    }

    // Extract only digits from formatted phone number
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    // Add country code if needed (default to US +1)
    let formattedPhone = cleanPhoneNumber;
    if (cleanPhoneNumber.length === 10) {
      formattedPhone = `+1${cleanPhoneNumber}`;
    } else if (cleanPhoneNumber.length === 11 && cleanPhoneNumber.startsWith('1')) {
      formattedPhone = `+${cleanPhoneNumber}`;
    } else if (!cleanPhoneNumber.startsWith('1') && cleanPhoneNumber.length >= 10) {
      formattedPhone = `+1${cleanPhoneNumber}`;
    }

    if (cleanPhoneNumber.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid phone number',
      });
      return;
    }

    try {
      await onSubmit(formattedPhone, name);
    } catch (error) {
      console.error('Phone input error:', error);
    }
  };

  const formatPhoneInput = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 11 digits max (1 + 10 digit US number)
    const limited = cleaned.slice(0, 11);
    
    // Format based on length
    if (limited.length === 0) {
      return '';
    } else if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else if (limited.length <= 10) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else {
      // Handle 11 digit numbers (with country code)
      return `+${limited.slice(0, 1)} (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'login' 
            ? 'Enter your phone number to sign in'
            : 'Enter your details to create a new account'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="1234567890 or (123) 456-7890"
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter your 10-digit phone number. We'll send a verification code to this number.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                {mode === 'login' ? 'Send login code' : 'Send verification code'}
              </>
            )}
          </Button>

          <div className="text-center">
            <Button 
              type="button"
              variant="link"
              onClick={onModeSwitch}
              disabled={isLoading}
              className="text-sm"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
