'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextI {}

const SocketContext = createContext<SocketContextI | null>(null);

type SocketProviderProps = {
  children: React.ReactNode;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  if (socket) {
    socket.on('msg', (data) => {
      console.log('data from server: ', data);
    });
    
  }

  useEffect(() => {
    const _socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '');
    _socket.on('connect', () => {
      console.log('socket connected');
    });

    setSocket(_socket);

    return () => {
      _socket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return socket;
};
