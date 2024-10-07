"/configs/sidebar.ts";

import { IoHome } from "react-icons/io5";
import { MdGroupAdd, MdGroups } from "react-icons/md";
import { useModalStore } from "@/hooks";

export const sidebarConfig = [
  {
    name: "Home",
    icon: IoHome,
    path: "/",
    action: () => {
      console.log("Home");
    },
  },
  {
    name: "Create Group",
    icon: MdGroupAdd,
    path: null,
    action: () => {
      const store = useModalStore.getState();
      const toggleCreateGroup = store.setCreateGroup;
      toggleCreateGroup();
    },
  },
  {
    name: "Join Group",
    icon: MdGroups,
    path: null,
    action: () => {
      const store = useModalStore.getState();
      const toggleJoinGroup = store.setJoinGroup;
      toggleJoinGroup();
    },
  },
];
