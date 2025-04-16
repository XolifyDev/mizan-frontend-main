import React from "react";
import Footer from "@/components/Footer";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default Layout;
