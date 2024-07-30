"use client";
import * as React from "react";
import { twMerge } from "tailwind-merge";

interface BoxProps {
  children: React.ReactNode;
  className?: string;
}

const Box: React.FC<BoxProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge("bg-background h-fit w-full rounded-lg p-2", className)}
    >
      {children}
    </div>
  );
};

export default Box;
