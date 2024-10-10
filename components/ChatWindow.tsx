"use client";
import * as React from "react";
import { useSession } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ChatHeader,
  Loader,
  MessageInput,
  NoData,
} from "./index";
import { avatarFLGen, GroupT, RoomMessage, UserT } from "@/utils";
import { cn } from "@/lib/utils";
import { useGroupStore } from "@/hooks";
import useMessagesStore from "@/hooks/useMessagesStore";

interface MessageWindowProps {
  messages: RoomMessage[];
  user: UserT;
  loading: boolean;
  group: GroupT;
}

const MessageWindow: React.FC<MessageWindowProps> = ({
  messages,
  user,
  loading,
  group,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (loading) {
    return (
      <div
        aria-label="chat-messages"
        className="flex flex-col h-full w-full  border rounded-md p-2"
      >
        <Loader />
      </div>
    );
  }

  return (
    <div
      aria-label="chat-messages"
      className="flex flex-col gap-2 h-full w-full overflow-y-auto border rounded-md p-2"
    >
      {messages.map((item) => {
        const { sent_by, message, id } = item;
        const sender = group.members?.find((item) => item.id === sent_by);
        const isUserSender = sent_by === user.id;

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
                <AvatarImage src={sender?.image} />
                <AvatarFallback>
                  {avatarFLGen(sender?.name || "")}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "rounded-lg whitespace-pre-line text-sm max-w-[75%] px-3 py-2",
                isUserSender
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted rounded-tl-none"
              )}
            >
              {message}
            </div>
            {isUserSender && (
              <Avatar className="w-7 h-7">
                <AvatarImage src={sender?.image} />
                <AvatarFallback>
                  {avatarFLGen(sender?.name || "")}
                </AvatarFallback>
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
  const { activeGroup } = useGroupStore();
  const { data: session } = useSession();
  const { messages, fetchMessages, messagesLoading } = useMessagesStore();

  if (!session?.user) {
    return null;
  }

  if (!activeGroup) {
    return <NoData message="please select a group to chat" />;
  }

  React.useEffect(() => {
    if (activeGroup) {
      console.log("getting called");
      fetchMessages(activeGroup.id);
    }
  }, [activeGroup]);

  return (
    <div className="flex flex-col h-full w-full ">
      <ChatHeader group={activeGroup} onGroupClick={() => {}} />
      <div
        aria-label="chat-container"
        className="flex flex-col gap-2 w-full h-full p-2 pb-4 overflow-hidden"
      >
        <MessageWindow
          user={session?.user}
          messages={messages}
          loading={messagesLoading}
          group={activeGroup}
        />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatWindow;
