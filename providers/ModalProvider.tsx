"use client";

import  JoinOrCreateModal  from "@/components/JoinOrCreateModal";
import React, { useEffect, useState } from "react";


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
      <JoinOrCreateModal />
    </>
  );
};

export default ModalProvider;
