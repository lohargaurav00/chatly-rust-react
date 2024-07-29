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
      if (roomId === "create"){
        socket.send(
          JSON.stringify({
            mode: "CreateRoom",
            message: JSON.stringify({ room_id: "1234", name: "gaurav" }),
          })
        );
        return;
      }
      socket.send(
        JSON.stringify({
          mode: "JoinRoom",
          message: JSON.stringify({ id: "a0000e13-56f4-4c9d-adbc-e934a1d35b3e", room_id: "1234" }),
        })
      );
    }
  };

  const sendMessage: SocketContextType["sendMessage"] = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          mode: "Chat",
          message: JSON.stringify({ chat_type: "send-message", ...message, room_id: "1234" }),
        })
      );
    }
  };

  React.useEffect(() => {
    const _socket = new WebSocket(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000/ws"
    );

    _socket.onopen = () => {
      console.log("WebSocket connected");
      // _socket.send(JSON.stringify({ type: "text", data: "pinging..." }));
    };

    _socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("chat_type", message);
      if (message.chat_type !== "message") return;
      // console.log("Received message", message);
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
