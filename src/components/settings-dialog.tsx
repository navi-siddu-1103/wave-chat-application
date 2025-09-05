'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Volume2, 
  Shield, 
  Palette,
  Download,
  Trash2,
  Eye,
  MessageSquare,
  Users,
  Lock
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { ThemeDemo } from './theme-demo';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme, actualTheme } = useTheme();
  const { toast } = useToast();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('en');
  const [autoDownload, setAutoDownload] = useState('wifi');

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
    toast({
      title: 'Theme updated',
      description: `Switched to ${newTheme} theme`,
    });
  };

  const handleClearData = () => {
    toast({
      title: 'Data cleared',
      description: 'App cache has been cleared',
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Export started',
      description: 'Your data export will be ready shortly',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your app preferences and account settings
          </DialogDescription>
          <div className="mt-2 text-xs text-muted-foreground">
            Current theme: <span className="font-medium">{theme}</span> 
            {theme === 'system' && <span> (resolved: {actualTheme})</span>}
          </div>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Shield className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme</CardTitle>
                <CardDescription>
                  Choose how Wave looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={theme} onValueChange={handleThemeChange}>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}>
                    <RadioGroupItem value="light" id="light" />
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <Label htmlFor="light" className="font-medium">Light</Label>
                      <p className="text-sm text-muted-foreground">Clean and bright interface</p>
                    </div>
                    {theme === 'light' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}>
                    <RadioGroupItem value="dark" id="dark" />
                    <Moon className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <Label htmlFor="dark" className="font-medium">Dark</Label>
                      <p className="text-sm text-muted-foreground">Easy on the eyes in low light</p>
                    </div>
                    {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${theme === 'system' ? 'ring-2 ring-primary' : ''}`}>
                    <RadioGroupItem value="system" id="system" />
                    <Monitor className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <Label htmlFor="system" className="font-medium">System</Label>
                      <p className="text-sm text-muted-foreground">Follows your device settings</p>
                    </div>
                    {theme === 'system' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <ThemeDemo />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Display</CardTitle>
                <CardDescription>
                  Customize the app's appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Font Size</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred text size
                    </p>
                  </div>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred language
                    </p>
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new messages
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Sound
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for notifications
                    </p>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Preview
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show message content in notifications
                    </p>
                  </div>
                  <Switch checked={messagePreview} onCheckedChange={setMessagePreview} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy</CardTitle>
                <CardDescription>
                  Control your privacy and visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Online Status
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show when you're online to others
                    </p>
                  </div>
                  <Switch checked={onlineStatus} onCheckedChange={setOnlineStatus} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Read Receipts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show when you've read messages
                    </p>
                  </div>
                  <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Auto Download
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically download media
                    </p>
                  </div>
                  <Select value={autoDownload} onValueChange={setAutoDownload}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="wifi">Wi-Fi only</SelectItem>
                      <SelectItem value="always">Always</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data & Storage</CardTitle>
                <CardDescription>
                  Manage your app data and storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleClearData}
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Version</span>
                  <span className="text-sm text-muted-foreground">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Build</span>
                  <span className="text-sm text-muted-foreground">2025.09.05</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Platform</span>
                  <span className="text-sm text-muted-foreground">Web</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
