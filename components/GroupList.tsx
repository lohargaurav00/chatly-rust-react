"use client";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage, Box } from "./index";

const GroupList = () => {
  return (
    <div className="flex flex-col gap-2 h-full w-full md:max-w-[300px] lg:max-w-[400px] border-r">
      <Box className="hidden md:inline-flex  gap-4 w-full rounded-none items-center border-b shadow-md">
        <h2 className="text-lg">Groups</h2>
        <Avatar className="cursor-pointer hover:scale-105 duration-200 transition invisible">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </Box>
    </div>
  );
};

export default GroupList;
