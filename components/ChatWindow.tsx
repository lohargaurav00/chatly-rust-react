"use client";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ChatHeader,
  MessageInput,
} from "./index";
import { avatarFLGen, ReceiveMessageT, UserT } from "@/utils";
import { cn } from "@/lib/utils";
import { messages } from "@/utils/dummyMessages";

interface MessageWindowProps {
  messages: ReceiveMessageT[];
  user: UserT;
}

const MessageWindow: React.FC<MessageWindowProps> = ({ messages, user }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      aria-label="chat-messages"
      className="flex flex-col gap-2 h-full w-full overflow-y-auto border rounded-md p-2"
    >
      {messages.map((item) => {
        const { sender, message, id } = item;
        const isUserSender = sender.id === user.id;

        return (
          <div
            key={id}
            className={cn(
              "inline-flex gap-1 w-full",
              isUserSender ? "justify-end" : "justify-start"
            )}
          >
            {!isUserSender && (
              <Avatar className="w-7 h-7">
                <AvatarImage src={sender.profile_photo} />
                <AvatarFallback>{avatarFLGen(sender.name)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "rounded-lg whitespace-pre-line text-sm max-w-[75%] px-3 py-2",
                isUserSender ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              {message}
            </div>
            {isUserSender && (
              <Avatar className="w-7 h-7">
                <AvatarImage src={sender.profile_photo} />
                <AvatarFallback>{avatarFLGen(sender.name)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
      <div ref={scrollRef}></div>
    </div>
  );
};

const ChatWindow = () => {
  return (
    <div className="flex flex-col h-full w-full ">
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
        className="flex flex-col gap-2 w-full h-full p-2 pb-4 overflow-hidden"
      >
        <MessageWindow
          user={{
            id: 1,
            name: "Gaurav Lohar",
            email: "lohargaurav00@gmail.com",
            user_name: "lohargaurav00",
            profile_photo: "https://github.com/shadcn.png",
          }}
          messages={messages}
        />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatWindow;
