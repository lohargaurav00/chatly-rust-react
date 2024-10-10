"use client";
import { create } from "zustand";

import { toast } from "@/components/index";
import { getRequest } from "@/lib/apiHandlers";
import { GroupT } from "@/utils";

interface GroupStore {
  groups: GroupT[];
  activeGroup: GroupT | null;
  groupsLoading: boolean;
  actGroupLoading: boolean;
  setGroups: (groups: GroupT[]) => void;
  addGroup: (group: GroupT) => void;
  setActiveGroup: (group: GroupT) => void;
  setGroupsLoading: (loading: boolean) => void;
  fetchGroups: (userId: {}) => void;
}

const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  activeGroup: null,
  groupsLoading: false,
  actGroupLoading: false,
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  setGroupsLoading: (loading) => set({ groupsLoading: loading }),
  setActiveGroup: async (group) => {
    try {
      set({ actGroupLoading: true });

      const url = `room-with-members/${group.id}`;
      const resp = await getRequest(url);

      if (resp.status === "Ok") {
        set({ activeGroup: resp.data });
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
      set({ actGroupLoading: false });
    }
  },
  fetchGroups: async (userId) => {
    try {
      set({ groupsLoading: true });

      const url = `/get-user-rooms/${userId}`;
      const resp = await getRequest(url);

      if (resp.status === "Ok") {
        set({ groups: resp.data || [] });
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
      set({ groupsLoading: false });
    }
  },
}));

export default useGroupStore;
