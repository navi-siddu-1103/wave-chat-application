'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DevModeAlert } from './dev-mode-alert';

interface VerificationInputProps {
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  phoneNumber: string;
  verificationCode?: string; // For development mode
}

export function VerificationInput({ 
  onSubmit, 
  onResend, 
  onBack, 
  isLoading, 
  phoneNumber,
  verificationCode
}: VerificationInputProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (verificationCode?: string) => {
    const codeToSubmit = verificationCode || code.join('');
    
    if (codeToSubmit.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter the complete 6-digit code',
      });
      return;
    }

    try {
      await onSubmit(codeToSubmit);
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setTimeLeft(600); // Reset timer
      setCode(['', '', '', '', '', '']); // Clear code
      inputRefs.current[0]?.focus(); // Focus first input
      toast({
        title: 'Code sent',
        description: 'A new verification code has been sent to your phone',
      });
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const maskPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(-10, -7)}) ***-${cleaned.slice(-4)}`;
    }
    return phone;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">
          Verify your phone
        </CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to {maskPhoneNumber(phoneNumber)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DevModeAlert verificationCode={verificationCode} phoneNumber={phoneNumber} />
        
        <div className="flex justify-center space-x-2">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold"
              disabled={isLoading}
            />
          ))}
        </div>

        {timeLeft > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Code expires in {formatTime(timeLeft)}
          </p>
        )}

        <div className="space-y-3">
          <Button 
            onClick={() => handleSubmit()}
            className="w-full" 
            disabled={isLoading || code.some(digit => digit === '')}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify code'
            )}
          </Button>

          <Button 
            variant="outline"
            onClick={handleResend}
            className="w-full" 
            disabled={isResending || timeLeft > 0}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend code'
            )}
          </Button>

          <Button 
            variant="ghost"
            onClick={onBack}
            className="w-full" 
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change phone number
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
