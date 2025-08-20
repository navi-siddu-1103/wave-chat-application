'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

interface AddGroupDialogProps {
  children: React.ReactNode;
  onAddGroup: (group: { name: string; avatar?: string }) => void;
}

export function AddGroupDialog({ children, onAddGroup }: AddGroupDialogProps) {
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (name.trim()) {
      onAddGroup({
        name: name.trim().startsWith('#') ? name.trim() : `#${name.trim()}`,
        avatar: previewUrl || `https://placehold.co/40x40.png`
      });
      resetDialog();
      setIsOpen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetDialog = () => {
    setName('');
    setAvatarFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Enter the details for your new group channel below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Group name (e.g., #random)"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="avatar-file" className="text-right pt-2">
              Avatar
            </Label>
            <div className="col-span-3 flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20">
                <AvatarImage src={previewUrl ?? undefined} alt="Group avatar preview" />
                <AvatarFallback>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Input
                id="avatar-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {avatarFile ? avatarFile.name : 'Choose Image'}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleAdd} disabled={!name.trim()}>
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
