import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mizan - Dashboard",
  description: "Mizan Management Dashboard",
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return children;
};

export default Layout;
