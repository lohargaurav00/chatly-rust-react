"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { MdNightsStay, MdSettings, MdWbSunny } from "react-icons/md";

import { sidebarConfig } from "@/configs";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./index";

const Sidebar: React.FC = () => {
  const { setTheme } = useTheme();
  const router = useRouter();

  return (
    <Box className="w-fit rounded-none h-full flex flex-col justify-between items-center gap-6 shadow-md  border-r ">
      <div className="flex flex-col items-center gap-6">
        <Avatar className="cursor-pointer hover:scale-105 duration-200 transition">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-4 ">
          {sidebarConfig.map((item) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.name}>
                <TooltipProvider>
                  <Tooltip delayDuration={400}>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
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
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip delayDuration={400}>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MdWbSunny
                      size={IconSize}
                      className="rotate-0 text-primary scale-100 duration-300 transition-transform dark:-rotate-90 dark:scale-0"
                    />
                    <MdNightsStay
                      size={IconSize}
                      className="absolute text-primary rotate-90 scale-0  duration-300 transition-transform dark:rotate-0 dark:scale-100"
                    />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <TooltipContent side="right">
                <p className="text-xs text-muted-foreground">Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip delayDuration={400}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => {}}
              >
                <MdSettings size={IconSize} className="text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs text-muted-foreground">Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Box>
  );
};

export default Sidebar;
