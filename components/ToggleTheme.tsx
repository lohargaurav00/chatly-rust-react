"use client"
import React from "react";
import { useTheme } from "next-themes";
import { IconSize } from "@/utils";

import {
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
import { MdNightsStay, MdWbSunny } from "react-icons/md";

const ToggleTheme : React.FC = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip delayDuration={400}>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
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
  );
};

export default ToggleTheme;
