"use client";

import React, { useEffect, useState } from "react";

import { CreateGroup , JoinGroup} from "@/components/index";

interface ModalProviderProps {}

const ModalProvider: React.FC<ModalProviderProps> = () => {
  const [isMount, setIsMount] = useState<boolean>(false);

  useEffect(() => {
    setIsMount(true);
  }, []);

  if (!isMount) {
    return null;
  }
  
  return (
    <>
      <JoinGroup />
      <CreateGroup/>
    </>
  );
};

export default ModalProvider;
