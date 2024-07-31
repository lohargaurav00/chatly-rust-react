import { MdGroupAdd, MdGroups, MdSettings } from "react-icons/md";

export const headerConfig = [
  {
    name: "Create Group",
    icon: MdGroupAdd,
    path: null,
    action: () => {
      console.log("Create Group");
    },
  },
  {
    name: "Join Group",
    icon: MdGroups,
    path: null,
    action: () => {
      console.log("Join Group");
    },
  },
  {
    name: "Settings",
    icon: MdSettings,
    path: null,
    action: () => {
      console.log("Settings");
    },
  },
];
