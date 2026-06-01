import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import StoreProvider from "../components/store-provider";
import { PerformanceMonitor } from "../components/performance-monitor";
import 'nprogress/nprogress.css';

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

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
      <body className={`${manrope.variable} font-sans antialiased`}>
        <StoreProvider>
          {children}
        </StoreProvider>
        {process.env.NODE_ENV === "development" ? <PerformanceMonitor /> : null}
      </body>
    </html>
  );
}
