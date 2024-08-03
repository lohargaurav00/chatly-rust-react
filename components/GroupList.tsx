"use client";
import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Box,
  GroupItem,
  Input,
  NoData,
} from "./index";
import { GroupT } from "@/utils";

interface GroupItemsListProps {
  groups: GroupT[];
  onClick: (group: GroupT) => void;
}

const GroupItemsList: React.FC<GroupItemsListProps> = ({ groups, onClick }) => {
  if (groups && groups.length <= 0) {
    return <NoData message="Join Group's To Chat" />;
  }
  return (
    <div className="flex flex-col h-full gap-2 overflow-y-auto">
      {groups.map((group) => {
        return (
          <GroupItem
            key={group.id}
            group={group}
            active={false}
            onClick={() => onClick(group)}
          />
        );
      })}
    </div>
  );
};

interface GroupListProps {
  groups: GroupT[];
  onGroupClick: (group: GroupT) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onGroupClick }) => {
  const [search, setSearch] = React.useState("");

  const filGroups = search
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  return (
    <div className="flex flex-col h-full w-full md:max-w-[300px] gap-2 lg:max-w-[400px] border-r">
      <Box className="hidden md:inline-flex gap-4 w-full rounded-none items-center border-b shadow-md">
        <h2 className="text-lg">Groups</h2>
        <Avatar className="cursor-pointer hover:scale-105 duration-200 transition invisible">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </Box>
      <Box className="flex flex-col gap-2 h-full rounded-none pt-0">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <GroupItemsList
          groups={filGroups}
          onClick={(group) => {
            onGroupClick(group);
          }}
        />
      </Box>
    </div>
  );
};

export default GroupList;
