"use client";
import * as React from "react";
import { IoEllipsisVerticalSharp } from "react-icons/io5";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ToggleTheme,
} from "./index";
import { IconSize } from "@/utils";
import { headerConfig } from "@/configs/header";

const Header = () => {
  return (
    <Box className="inline-flex md:hidden gap-4 w-full rounded-none justify-between items-center border-b shadow-md">
      <Avatar className="cursor-pointer hover:scale-105 duration-200 transition">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="inline-flex gap-2 sm:gap-4">
        <ToggleTheme />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IoEllipsisVerticalSharp
                size={IconSize}
                className="text-primary"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {headerConfig.map((item) => {
              return (
                <React.Fragment key={item.name}>
                  <DropdownMenuItem onClick={() => item.action()}>
                    {item.name}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Box>
  );
};

export default Header;
