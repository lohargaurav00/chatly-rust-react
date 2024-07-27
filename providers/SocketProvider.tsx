"use client";
import * as React from "react";

import { receivedMessageT, sendMessageT } from "../utils/types";

type SocketProviderProps = {
  children: React.ReactNode;
};

type SocketContextType = {
  socket: WebSocket | null;
  joinRoom: (roomId: string) => void;
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

  const joinRoom: SocketContextType["joinRoom"] = (roomId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join-room", roomId }));
    }
  };

  const sendMessage: SocketContextType["sendMessage"] = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "send-message", message }));
    }
  };

  React.useEffect(() => {
    const _socket = new WebSocket(
      process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:4000"
    );

    _socket.onopen = () => {
      console.log("WebSocket connected");
      // _socket.send(JSON.stringify({ type: "ping", data: "pinging..." }));
    };

    _socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type !== "message") return;
      setMessages((prev) => [...prev, message]);
    };

    _socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(_socket);

    return () => {
      _socket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, joinRoom, sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
