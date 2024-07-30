"use client";

import React from "react";
import { Box, Sidebar } from "@/components/index";

const Page = () => {
  return (
    <div className="bg-primary-foreground w-full h-screen flex flex-col gap-4">
      <Sidebar />
    </div>
  );
};

export default Page;
