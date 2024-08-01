import * as React from "react";
import clsx from "clsx";

import { Avatar, AvatarFallback, AvatarImage, Card } from "./index";
import { GroupT, avatarFLGen } from "@/utils";

interface GroupItemProps {
  group: GroupT;
  active: boolean;
  onClick: () => void;
}

const GroupItem: React.FC<GroupItemProps> = ({ group, active, onClick }) => {
  return (
    <Card
      className={clsx(
        "inline-flex p-2 cursor-pointer gap-4 transition-all",
        active && "bg-primary"
      )}
      onClick={onClick}
    >
      <Avatar>
        <AvatarImage src={group.group_photo} />
        <AvatarFallback>{avatarFLGen(group.name)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0.5">
        <h3
          className={clsx(
            "font-medium no-wrap truncate",
            active && "text-white"
          )}
        >
          {group.name}
        </h3>
        <p
          className={clsx(
            "text-sm no-wrap truncate text-muted-foreground ",
            active && "text-primary-foreground/90"
          )}
        >
          {group.description
            ? group.description
            : "This group has no description"}
        </p>
      </div>
    </Card>
  );
};

export default GroupItem;
