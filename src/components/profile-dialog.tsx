'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Edit, Save, X, Phone, Calendar, Clock, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset values
      setEditedName(user?.name || '');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please select an image file',
        });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let avatarUrl = user?.avatar;

      // Handle avatar upload (in a real app, you'd upload to a service like AWS S3)
      if (avatarFile) {
        // For now, we'll use the preview as the avatar URL
        // In production, you'd upload the file to a storage service
        avatarUrl = avatarPreview || user?.avatar;
      }

      // Update user profile
      updateUser({
        name: editedName,
        avatar: avatarUrl,
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatJoinDate = (date?: string) => {
    if (!date) return 'Recently joined';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastSeen = () => {
    if (user?.online) return 'Online now';
    return 'Last seen recently';
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Profile' : 'Profile'}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your profile information' : 'Your profile information'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div 
              className={`relative ${isEditing ? 'cursor-pointer group' : ''}`}
              onClick={handleAvatarClick}
            >
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage 
                  src={avatarPreview || user.avatar} 
                  alt={user.name} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
              {user.online && (
                <div className="absolute bottom-2 right-2 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAvatarClick}
                className="text-xs"
              >
                <Camera className="h-3 w-3 mr-1" />
                Change Photo
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Profile picture upload"
            title="Upload profile picture"
          />

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground font-mono">
                  {user.phoneNumber}
                </span>
                <Badge variant="outline" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Status
              </Label>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {formatLastSeen()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Member Since */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Member Since
              </Label>
              <span className="text-sm text-muted-foreground">
                {formatJoinDate()}
              </span>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !editedName.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
