import { create } from 'zustand';

type RoomStore = {
  room: string;
  setRoom: (room: string) => void;
};

const useRoomStore = create<RoomStore>((set) => ({
  room: '',
  setRoom: (room) => set({ room }),
}));

export default useRoomStore;
