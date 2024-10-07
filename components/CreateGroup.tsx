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
import { useModalStore } from "../hooks";
import { useSocket } from "@/providers";
import { toast } from "./ui";

const CreateGroup = () => {
  const [name, setName] = useState<string>("")
  const { createGroup, setCreateGroup } = useModalStore();
  const { createRoom} = useSocket();
  
  const handleJoinRoom = () => {
    if(name.length <= 0) {
        toast({
            title: "Error",
            description: "Please Enter a group name"
        })
        return;
    }
    createRoom(name);
    setCreateGroup();
  };

  return (
    <Dialog
      open={createGroup}
      onOpenChange={() => {
        setCreateGroup();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="w-full text-center">Create Group</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 justify-start ">
          <Label htmlFor="name" className="text-left text-base">
            Enter Group Name
          </Label>
          <Input
            id="group_name_create"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button type="submit" onClick={handleJoinRoom}>
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
