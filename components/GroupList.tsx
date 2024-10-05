"use client";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Box,
  GroupItem,
  Input,
  Loader,
  NoData,
} from "./index";
import { GroupT } from "@/utils";

interface GroupItemsListProps {
  groups: GroupT[];
  isLoading: boolean;
  onClick: (group: GroupT) => void;
}

const GroupItemsList: React.FC<GroupItemsListProps> = ({
  groups,
  onClick,
  isLoading,
}) => {
  if (isLoading) {
    return <Loader />;
  }

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
  isLoading: boolean;
  onGroupClick: (group: GroupT) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  onGroupClick,
  isLoading,
}) => {
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
          isLoading={isLoading}
          onClick={(group) => {
            onGroupClick(group);
          }}
        />
      </Box>
    </div>
  );
};

export default GroupList;
