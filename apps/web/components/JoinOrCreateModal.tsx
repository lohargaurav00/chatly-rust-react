'use client';
import React, { useState } from 'react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { useModalStore } from '../hooks';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

const JoinOrCreateModal = () => {
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>('');

  const { isOpen, setOpenClose } = useModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpenClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-black">
          Join
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="w-full text-center">
            {isCreate ? 'Create Room' : 'Join Room'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Enter Room Id
            </Label>
            <Input
              id="name"
              value={roomId}
              className="col-span-3"
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinOrCreateModal;
