"use client"
import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

import { useModalStore } from '../hooks';

const JoinOrCreateModal = () => {
  const { isOpen, setOpenClose } = useModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpenClose()}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default JoinOrCreateModal;
