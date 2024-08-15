"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";

import { menuOptionConfig, sidebarConfig } from "@/configs";
import { IconSize } from "@/utils";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./index";

const MoreMenu = () => {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip delayDuration={400}>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="w-full"
                onClick={() => {}}
              >
                <BsThreeDotsVertical size={IconSize} className="text-primary" />
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent side="right">
            <p className="text-xs text-muted-foreground">More</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" side="left">
        {menuOptionConfig.map((menu) => {
          const Icon = menu.icon;
          return (
            <DropdownMenuItem key={menu.name} onClick={() => menu.action()}>
              <Icon
                size={IconSize}
                className="text-primary transition-colors mr-3"
              />
              {menu.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <Box className="hidden md:flex w-fit rounded-none h-full flex-col justify-between items-center gap-6 shadow-md  border-r ">
      <div className="flex flex-col items-center gap-6">
        <Avatar className="cursor-pointer hover:scale-105 duration-200 transition">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-4 w-full ">
          {sidebarConfig.map((item) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.name}>
                <TooltipProvider>
                  <Tooltip delayDuration={400}>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          if (item.path) {
                            router.push(item.path);
                            return;
                          }
                          item.action();
                        }}
                      >
                        <Icon
                          size={IconSize}
                          className="text-primary transition-colors"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs text-muted-foreground">
                        {item.name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <ToggleTheme />
        <MoreMenu />
      </div>
    </Box>
  );
};

export default Sidebar;
