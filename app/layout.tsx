import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "../components/store-provider";
import { PerformanceMonitor } from "../components/performance-monitor";
import 'nprogress/nprogress.css';

export const metadata: Metadata = {
  title: "Mizan - All in One Masjid Management",
  description:
    "Mizan brings together essential tools to streamline masjid operations and enhance community engagement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
        <PerformanceMonitor />
      </body>
    </html>
  );
}
