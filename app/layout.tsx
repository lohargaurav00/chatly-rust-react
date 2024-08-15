import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { NextAuthProvider, SocketProvider, ThemeProvider } from "@/providers";
import "./globals.css";
import { Layout, Toaster } from "@/components/index";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatly-React-Rust",
  description: "Group chat application built with React and Rust",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <SocketProvider>
              <Layout>{children}</Layout>
              <Toaster />
            </SocketProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
