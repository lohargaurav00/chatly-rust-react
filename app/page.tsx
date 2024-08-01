"use client";

import * as React from "react";
import { ChatContainer, GroupList } from "@/components/index";

const Page = () => {'' 
  return (
    <main className="w-full h-full flex">
      <GroupList />
      <ChatContainer />
    </main>
  );
};

export default Page;
