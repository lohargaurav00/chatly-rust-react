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
    <Box>
      <h2>Something went wrong!</h2>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </Box>
  );
};

export default Error;
