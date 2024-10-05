"use client";
import React, { useState } from "react";
import ShortUniqueId from "short-unique-id";
import { HiOutlineClipboardCopy } from "react-icons/hi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useModalStore, useRoomStore } from "../hooks";
import { useSocket } from "@/providers";

const JoinOrCreateModal = () => {
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");

  const { isOpen, setOpenClose } = useModalStore();
  const { setRoom } = useRoomStore();
  const { joinRoom } = useSocket();
  const { randomUUID } = new ShortUniqueId({ length: 10 });

  const handleJoinRoom = () => {
    joinRoom(roomId);
    setRoom(roomId);
    setOpenClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setOpenClose();
        setIsCreate(false);
        setRoomId("");
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="w-full text-center">
            {isCreate ? "Create Room" : "Join Room"}
          </DialogTitle>
        </DialogHeader>
        {isCreate ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 py-4 ">
              <span>Generated Room Id</span>
              <span className="w-full p-4 text-center text-lg font-semibold text-black border border-gray-300 rounded-md relative">
                {roomId}
                <HiOutlineClipboardCopy
                  className="absolute h-8 w-8 right-2 cursor-pointer top-3"
                  onClick={() => {
                    navigator.clipboard.writeText(roomId);
                    setOpenClose();
                  }}
                />
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4 justify-start ">
            <Label htmlFor="name" className="text-left text-base">
              Enter Room Id
            </Label>
            <Input
              id="name"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          {!isCreate && (
            <div className="flex items-center justify-end gap-2 text-sm ">
              {"Don't have a room?"}
              <Button
                variant="link"
                className="px-0 text-base"
                onClick={() => {
                  setIsCreate(true);
                  setRoomId(randomUUID());
                }}
              >
                Create Room
              </Button>
            </div>
          )}
          <Button type="submit" onClick={handleJoinRoom}>
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinOrCreateModal;
