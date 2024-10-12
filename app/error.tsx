"use client";
import * as React from "react";

import { Box, Button } from "@/components/index";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error: React.FC<ErrorProps> = ({ error, reset }) => {


  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box className="flex flex-col gap-2 w-full h-full justify-center items-center">
      <h2>Something went wrong!</h2>
      <p>Error : {error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </Box>
  );
};

export default Error;
