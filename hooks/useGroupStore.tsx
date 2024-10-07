"use client"
import { create } from "zustand";

import { toast } from "@/components";
import { getRequest } from "@/lib/apiHandlers";
import { GroupT } from "@/utils";

interface GroupStore {
  groups: GroupT[];
  activeGroup: GroupT | null;
  groupsLoading: boolean;
  setGroups: (groups: GroupT[]) => void;
  setActiveGroup: (group: GroupT) => void;
  setGroupsLoading: (loading: boolean) => void;
  fetchGroups: (userId: {}) => void;
}

const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  activeGroup: null,
  groupsLoading: false,
  setGroups: (groups) => set({ groups }),
  setActiveGroup: (group) => set({ activeGroup: group }),
  setGroupsLoading: (loading) => set({ groupsLoading: loading }),
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
