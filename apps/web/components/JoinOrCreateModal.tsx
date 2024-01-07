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
        {isCreate ? (
          <div>
            <span>Generate Room Id</span>
            <div className="flex flex-col gap-4 py-4 border border-gray-400 w-full">
              <span className="p-4 w-full text-center text-lg font-semibold text-black">
                mkkmkmkmmk
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <Label htmlFor="name" className="text-right">
              Enter Room Id
            </Label>
            <Input
              id="name"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button type="submit"> Join Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinOrCreateModal;
