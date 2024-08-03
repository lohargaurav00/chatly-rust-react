"use client";

import * as React from "react";

import { ChatWindow, GroupList } from "@/components/index";
import { GroupT } from "@/utils";

const Page = () => {
  const [groups, setGroups] = React.useState<GroupT[]>([]);
  const [activeGroup, setActiveGroup] = React.useState<GroupT | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main className="w-full h-full flex">
      {isMobile ? (
        activeGroup ? (
          <ChatWindow />
        ) : (
          <GroupList
            groups={groups}
            onGroupClick={(group) => setActiveGroup(group)}
          />
        )
      ) : (
        <>
          <GroupList
            groups={groups}
            onGroupClick={(group) => setActiveGroup(group)}
          />
          <ChatWindow />
        </>
      )}
    </main>
  );
};

export default Page;
