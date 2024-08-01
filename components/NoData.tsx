import React from "react";
import Image from "next/image";

interface NoDataProps {
  message: string;
  description?: string;
}

const NoData: React.FC<NoDataProps> = ({ message, description }) => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center gap-4">
      <Image
        src="/assets/images/no_data.png"
        alt="No Data"
        width={300}
        height={300}
        className="max-w-full max-h-full"
      />
      <h2 className="text-lg font-medium">{message}</h2>
      {description && (
        <p className="text-sm text-muted-foreground font-thin">{description}</p>
      )}
    </div>
  );
};

export default NoData;
