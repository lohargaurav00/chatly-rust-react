"/configs/menuOptions.ts";

import { MdOutlineLogout, MdSettings } from "react-icons/md";
import { signOut } from "next-auth/react";

export const menuOptionConfig = [
  {
    name: "Settings",
    icon: MdSettings,
    path: null,
    action: () => {
      console.log("settings");
    },
  },
  {
    name: "Logout",
    icon: MdOutlineLogout,
    path: null,
    action: async () => {
      await signOut();
    },
  },
];
