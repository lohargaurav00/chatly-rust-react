"use client"
import {  create } from 'zustand';

type ModalStore = {
  isOpen: boolean;
  setOpenClose: () => void;
};

const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  setOpenClose: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useModalStore;
