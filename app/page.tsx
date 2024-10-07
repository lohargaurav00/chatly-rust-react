"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { ChatWindow, GroupList} from "@/components/index";
import { useGroupStore } from "@/hooks";

const Page = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const { fetchGroups, activeGroup, setActiveGroup, groups, groupsLoading } =
    useGroupStore();
  const { data: session } = useSession();

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

  React.useEffect(() => {
    if (session?.user.id) {
      fetchGroups(session?.user.id);
    }
  }, [session]);

  return (
    <main className="w-full h-full flex">
      {isMobile ? (
        activeGroup ? (
          <ChatWindow />
        ) : (
          <GroupList
            groups={groups}
            isLoading={groupsLoading}
            onGroupClick={(group) => setActiveGroup(group)}
          />
        )
      ) : (
        <>
          <GroupList
            groups={groups}
            isLoading={groupsLoading}
            onGroupClick={(group) => setActiveGroup(group)}
          />
          <ChatWindow />
        </>
      )}
    </main>
  );
};

export default Page;
