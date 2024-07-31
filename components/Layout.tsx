import * as React from "react";
import { Sidebar } from "./index";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-full flex border overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
};

export default Layout;
