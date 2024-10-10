"use client";
import { create } from "zustand";

import { toast } from "@/components";
import { getRequest } from "@/lib/apiHandlers";
import { RoomMessage } from "@/utils";

interface MessageStore {
  messages: RoomMessage[];
  count: number;
  messagesLoading: boolean;
  setMessages: (messages: RoomMessage[]) => void;
  addMessage: (message: RoomMessage) => void;
  fetchMessages: (
    room_id: number,
    page?: number | null | undefined,
    pageSize?: number | null | undefined
  ) => void;
}

const useMessagesStore = create<MessageStore>((set) => ({
  messages: [],
  count: 0,
  messagesLoading: false,
  setMessages: (messages) => set(() => ({ messages })),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  fetchMessages: async (room_id, page = null, pageSize = null) => {
    try {
      set({ messagesLoading: true });

      const url = "/messages-by-room-id";
      const resp = await getRequest(url, { room_id, page, pageSize });

      if (resp.status === "Ok") {
        if (!page || page === 1) {
          return set({ messages: resp.data || [], count: resp.count });
        }
        set((state) => ({
          messages: state.messages.concat(resp.data || []),
          count: resp.count,
        }));
      } else {
        toast({
          title: "Error",
          description: resp.message,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message,
      });
    } finally {
      set({ messagesLoading: false });
    }
  },
}));

export default useMessagesStore;
