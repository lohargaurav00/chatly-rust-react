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
  if(groups && groups.length <= 0) {
    return <NoData message="Join Group's To Chat"/>
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

const GroupList = () => {
  const [search, setSearch] = React.useState("");
  const [groups, setGroups] = React.useState<GroupT[]>([]);
  const [activeGroup, setActiveGroup] = React.useState<GroupT | null>(null);

  const filGroups = search
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  return (
    <div className="flex flex-col h-full w-full md:max-w-[300px] lg:max-w-[400px] border-r">
      <Box className="hidden md:inline-flex  gap-4 w-full rounded-none items-center border-b shadow-md">
        <h2 className="text-lg">Groups</h2>
        <Avatar className="cursor-pointer hover:scale-105 duration-200 transition invisible">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </Box>
      <Box className="flex flex-col gap-2 h-full rounded-none">
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
            setActiveGroup(group);
          }}
        />
      </Box>
    </div>
  );
};

export default GroupList;
