'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';

export function ThemeDemo() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Demo
        </CardTitle>
        <CardDescription>
          Current: {theme} {theme === 'system' && `(${actualTheme})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Sun className="h-4 w-4" />
            <span className="text-xs">Light</span>
          </Button>
          
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Moon className="h-4 w-4" />
            <span className="text-xs">Dark</span>
          </Button>
          
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Monitor className="h-4 w-4" />
            <span className="text-xs">System</span>
          </Button>
        </div>
        
        {/* Demo content that shows the current theme */}
        <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
          <div className="text-sm font-medium">Sample Content</div>
          <div className="text-xs text-muted-foreground">
            This content changes with the theme
          </div>
          <div className="h-2 bg-primary rounded-full w-3/4"></div>
          <div className="flex justify-between items-center">
            <div className="h-1.5 bg-foreground/60 rounded w-16"></div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
