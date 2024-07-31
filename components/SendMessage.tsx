"use client"
import React, { useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRoomStore } from "../hooks";
import { useSocket } from "@/providers";

const SendMessage = () => {
  const [message, setMessage] = useState<string>("");

  const { sendMessage } = useSocket();
  const { room } = useRoomStore();

  const handleSendMessage = () => {
    const _message = {
      message,
      room_id: room,
    };
    sendMessage(_message);
    setMessage("");
  };

  return (
    <div className="inline-flex gap-3">
      <Input
        id="name"
        className="w-[400px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSendMessage();
        }}
        placeholder="Type your message here..."
      />
      <Button onClick={handleSendMessage}>Send</Button>
    </div>
  );
};

export default SendMessage;
