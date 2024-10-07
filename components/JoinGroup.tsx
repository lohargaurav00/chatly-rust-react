"use client";
import React, { useState } from "react";

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

const JoinGroup = () => {
  const [roomId, setRoomId] = useState<string>("");

  const { joinGroup, setJoinGroup } = useModalStore();
  const { setRoom } = useRoomStore();
  const { joinRoom } = useSocket();

  const handleJoinRoom = () => {
    joinRoom(roomId);
    setRoom(roomId);
    setJoinGroup();
  };

  return (
    <Dialog
      open={joinGroup}
      onOpenChange={() => {
        setJoinGroup();
        setRoomId("");
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="w-full text-center">Join Room</DialogTitle>
        </DialogHeader>
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
        <DialogFooter className="gap-2">
          <Button type="submit" onClick={handleJoinRoom}>
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroup;
