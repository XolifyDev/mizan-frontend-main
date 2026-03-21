import React from "react";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      {children}
      <Toaster />
      <Footer />
    </>
  );
};

export default Layout;
