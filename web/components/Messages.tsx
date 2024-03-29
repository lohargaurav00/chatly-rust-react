import React from 'react';
import { useMessagesStore } from '../hooks';

const Messages = () => {
  const { messages } = useMessagesStore();
  return (
    <div>
      <h1 className='text-2xl font-bold'>Messages</h1>
      <div className='flex-col flex gap-1'>
      {messages.map((message, index) => (
        <div key={index} className="inline-flex">
          <p>
            {message.sender.slice(0,4)}: {message.message}
          </p>
        </div>
      ))}
      </div>
    </div>
  );
};

export default Messages;
 