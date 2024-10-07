"use client";
import * as React from "react";
import { useSession } from "next-auth/react";

import { receivedMessageT, sendMessageT } from "@/utils/types";
import { useGroupStore, useRoomStore } from "@/hooks";
import { toast } from "@/components/index";

type SocketProviderProps = {
  children: React.ReactNode;
};

type SocketContextType = {
  socket: WebSocket | null;
  joinRoom: (roomId: string) => void;
  createRoom: (name: string) => void;
  sendMessage: (message: sendMessageT) => void;
  messages: receivedMessageT[];
};

const SocketContext = React.createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = React.useState<SocketContextType["socket"]>(null);
  const [messages, setMessages] = React.useState<receivedMessageT[]>([]);

  const { data: session, status } = useSession();
  const { room } = useRoomStore();
  const { groups, setGroups } = useGroupStore();

  const joinRoom: SocketContextType["joinRoom"] = (roomId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        mode: "JoinRoom",
        message: JSON.stringify({
          id: session?.user.id,
          room_id: +roomId,
        }),
      });

      socket.send(message);
    }
  };

  const createRoom: SocketContextType["createRoom"] = (name) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          mode: "CreateRoom",
          message: JSON.stringify({
            id: session?.user.id,
            name,
          }),
        })
      );
    }
  };

  const sendMessage: SocketContextType["sendMessage"] = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          mode: "Chat",
          message: JSON.stringify({
            chat_type: "send-message",
            ...message,
            room_id: room,
          }),
        })
      );
    }
  };

  React.useEffect(() => {
    if (!session || status !== "authenticated") return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const connUrl = `${socketUrl}/${session.user.id}`;

    const _socket = new WebSocket(connUrl);

    _socket.onopen = () => {
      console.log("WebSocket connected");
      // _socket.send(JSON.stringify({ type: "text", data: "pinging..." }));
    };

    _socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("chat_type", message);
      const chatTypes = ["message", "error", "info"];
      if (!chatTypes.includes(message.chat_type)) return;

      switch (message?.chat_type) {
        case "message":
          setMessages((prev) => [...prev, message]);
          break;

        case "info":
          const room = message?.join_room ?  message.join_room : message.create_room;
          setGroups([...groups, room]);
          break;

        case "error":
          toast({
            title: "Error",
            description: message?.message,
          });
          break;

        default:
          break;
      }
    };

    _socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(_socket);

    return () => {
      _socket.close();
    };
  }, [session, status]);

  return (
    <SocketContext.Provider
      value={{ socket, joinRoom, createRoom, sendMessage, messages }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
