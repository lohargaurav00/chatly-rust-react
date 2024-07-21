'use client';
import React from 'react';
import JoinOrCreateModal from '../components/JoinOrCreateModal';
import Messages from '../components/Messages';
import SendMessage from '../components/SendMessage';

const Page = () => {
  return (
    <div className="m-3 flex flex-col gap-4">
      <div className="w-10">
        <JoinOrCreateModal />
      </div>

      <SendMessage />
      <Messages />
    </div>
  );
};

export default Page;
