import React from "react";
import ChatHeader from "./ChatHeader";

const ChatContainer = () => {
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
    </div>
  );
};

export default ChatContainer;
