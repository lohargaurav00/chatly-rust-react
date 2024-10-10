"use client"
import React, { useState } from "react";
import { useSession } from "next-auth/react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSocket } from "@/providers";
import { useGroupStore } from "@/hooks";

const SendMessage = () => {
  const [message, setMessage] = useState<string>("");

  const {activeGroup} = useGroupStore();
  const {data: session} = useSession()
  const { sendMessage } = useSocket();


  const handleSendMessage = () => {
    if(!session?.user.id || !activeGroup?.id) return;
    const _message = {
      message,
      room_id: activeGroup.id,
      sent_by: session.user.id
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
