"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Box,
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./index";
import { sidebarConfig } from "@/configs";

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = ({}) => {
  return (
    <Box className="w-fit rounded-none h-full flex flex-col gap-6 shadow-md">
      <Avatar className="cursor-pointer hover:scale-105 duration-200 transition">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Separator />
      <div className="flex flex-col gap-3 ">
        {sidebarConfig.map((item, index) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.name}>
              <TooltipProvider >
                <Tooltip delayDuration={400}>
                  <TooltipTrigger asChild >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      onClick={() => item.action()}
                    >
                      <Icon size={20} color="var(--secondary-foreground)"/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {sidebarConfig.length - 1 > index && <Separator />}
            </React.Fragment>
          );
        })}
      </div>
    </Box>
  );
};

export default Sidebar;
