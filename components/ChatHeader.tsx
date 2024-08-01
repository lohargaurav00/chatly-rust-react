import * as React from "react";

import { avatarFLGen, GroupT } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage, Box } from "./index";

interface ChatHeaderProps {
  group: GroupT;
  onGroupClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ group, onGroupClick }) => {
  return (
    <Box className="inline-flex gap-4 w-full rounded-none justify-between items-center border-b shadow-md">
      <div
        className="inline-flex gap-4 items-center cursor-pinter"
        onClick={onGroupClick}
      >
        <Avatar>
          <AvatarImage src={group.group_photo} />
          <AvatarFallback>{avatarFLGen(group.name)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-medium no-wrap truncate">{group.name}</h2>
      </div>
    </Box>
  );
};

export default ChatHeader;
