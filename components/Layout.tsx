import * as React from "react";
import { Sidebar, Header } from "./index";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-full w-full flex overflow-hidden">
      <Sidebar />
      <div className="flex flex-col h-full w-full">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default Layout;
