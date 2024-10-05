"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { ChatWindow, GroupList, toast } from "@/components/index";
import { GroupT } from "@/utils";
import { getRequest } from "@/lib/apiHandlers";

const Page = () => {
  const [groups, setGroups] = React.useState<GroupT[]>([]);
  const [groupsLoading, setGroupsLoading] = React.useState<boolean>(false);
  const [activeGroup, setActiveGroup] = React.useState<GroupT | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

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
    const getGroups = async () => {
      if (!session) return;
      try {
        setGroupsLoading((prev) => !prev);

        const url = `/get-user-rooms/${session.user.id}`;
        const resp = await getRequest(url);
        if (resp.status === "Ok") {
          setGroups(resp?.data || []);
        } else {
          toast({
            title: "Error",
            description: resp?.message,
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message,
        });
      } finally {
        setGroupsLoading((prev) => !prev);
      }
    };
    
    getGroups();
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
