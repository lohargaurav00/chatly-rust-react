"use client";

import React from "react";
import { ScaleLoader } from "react-spinners";

import { Box } from "@/components/index";

const loading = () => {
  return (
    <Box className="h-full flex items-center justify-center">
      <ScaleLoader color="var(--primary-foreground)" />
    </Box>
  );
};

export default loading;
