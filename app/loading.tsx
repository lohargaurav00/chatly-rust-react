"use client";

import React from "react";

import { Box } from "@/components/index";
import { Loader2 } from "lucide-react";

const loading = () => {
  return (
    <Box className="h-full flex items-center justify-center">
       <Loader2 className="h-10 w-10 animate-spin text-foreground" />
    </Box>
  );
};

export default loading;
