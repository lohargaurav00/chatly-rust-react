"/configs/sidebar.ts";

import { IoHome } from "react-icons/io5";
import { MdGroupAdd, MdGroups } from "react-icons/md";

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
    name: "Create Room",
    icon: MdGroupAdd,
    path: null,
    action: () => {
      console.log("Create Room");
    },
  },
  {
    name: "Join Room",
    icon: MdGroups,
    path: null,
    action: () => {
      console.log("Join Room");
    },
  },
];
