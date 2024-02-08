import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

import { sendMessageT } from '../utils/types';
import { useMessagesStore } from '.';

type UseSocket = {
  socket: Socket | null;
  joinRoom: (roomId: string) => void;
  sendMessage: (message: sendMessageT) => void;
};

const useSocket = (): UseSocket => {
  const [socket, setSocket] = useState<UseSocket['socket']>(null);

  const { setMessages } = useMessagesStore();

  const joinRoom: UseSocket['joinRoom'] = (roomId) => {
    socket?.emit('join-room', roomId);
  };

  const sendMessage: UseSocket['sendMessage'] = (message) => {
    if (socket) {
      socket.emit('send-message', message);
    }
  };

  useEffect(() => {
    const _socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '');

    _socket.on('connect', () => {
      console.log('socket connected');
    });

    _socket.on('joined-room', (data) => {
      console.log('From Server::>', data);
    });

    _socket.on('message', (message) => {
      console.log(message)
      setMessages(message);
    });

    setSocket(_socket);

    return () => {
      _socket.disconnect();
    };
  }, [setMessages]);

  return {
    socket,
    joinRoom,
    sendMessage,
  };
};

export default useSocket;
