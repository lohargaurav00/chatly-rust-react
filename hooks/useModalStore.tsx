"use client";
import { create } from "zustand";

type ModalStore = {
  joinGroup: boolean;
  createGroup: boolean;
  setJoinGroup: () => void;
  setCreateGroup: () => void;
};

const useModalStore = create<ModalStore>((set) => ({
  joinGroup: false,
  createGroup: false,
  setJoinGroup: () => {
    set((state) => ({ joinGroup: !state.joinGroup }));
  },
  setCreateGroup: () => set((state) => ({ createGroup: !state.createGroup })),
}));

export default useModalStore;
