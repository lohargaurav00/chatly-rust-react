"use client";
import * as React from "react";

import { ChatHeader, MessageInput } from "./index";

const ChatWindow = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <ChatHeader
        group={{
          id: 1,
          name: "Group name 1",
          group_photo: "https://github.com/shadcn.png",
        }}
        onGroupClick={() => {}}
      />
      <div
        aria-label="chat-container"
        className="flex flex-col gap-2 w-full h-full p-2 "
      >
        <div aria-label="chat-messages" className="h-full "></div>
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatWindow;
