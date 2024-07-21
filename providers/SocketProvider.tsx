"use client";
import * as React from "react";
import { Socket, io } from "socket.io-client";

import { receivedMessageT, sendMessageT } from "../utils/types";

type SocketProviderProps = {
  children: React.ReactNode;
};

type SocketContext = {
  socket: Socket | null;
  joinRoom: (roomId: string) => void;
  sendMessage: (message: sendMessageT) => void;
  messages: receivedMessageT[];
};

const SocketContext = React.createContext<SocketContext | null>(null);

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [messages, setMessages] = React.useState<receivedMessageT[]>([]);

  const joinRoom: SocketContext["joinRoom"] = (roomId) => {
    socket?.emit("join-room", roomId);
  };

  const sendMessage: SocketContext["sendMessage"] = (message) => {
    if (socket) {
      socket.emit("send-message", message);
    }
  };

  React.useEffect(() => {
    const _socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");

    _socket.on("connect", () => {
      console.log("socket connected");
    });

    _socket.on("joined-room", (data) => {
      console.log("From Server::>", data);
    });

    _socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(_socket);

    return () => {
      _socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, joinRoom, sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
