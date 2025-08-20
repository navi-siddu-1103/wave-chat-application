'use client';

import { useState } from 'react';
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
import type { User } from '@/lib/types';

interface AddContactDialogProps {
  children: React.ReactNode;
  onAddContact: (user: User) => void;
}

export function AddContactDialog({ children, onAddContact }: AddContactDialogProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (name.trim()) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        avatar: avatar.trim() || `https://placehold.co/40x40.png`,
        online: false,
      };
      onAddContact(newUser);
      setName('');
      setAvatar('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Enter the details of your new contact below.
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
              placeholder="Contact's name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">
              Avatar URL
            </Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="col-span-3"
              placeholder="(Optional) Image URL"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleAdd} disabled={!name.trim()}>
            Add Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
