import React from "react";
import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <Loader2 className="h-10 w-10 animate-spin text-foreground" />
    </div>
  );
};

export default Loader;
