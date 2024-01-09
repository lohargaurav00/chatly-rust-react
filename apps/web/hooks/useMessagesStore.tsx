import { create } from 'zustand';

import { receivedMessageT } from '../utils/types';

type MessagesStore = {
  messages: receivedMessageT[];
  setMessages: (message: receivedMessageT) => void;
};

const useMessagesStore = create<MessagesStore>((set) => ({
  messages: [],
  setMessages: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

export default useMessagesStore;
