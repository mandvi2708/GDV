import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { SocketProvider } from "@/features/discussion/SocketProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GDVerse | AI-Powered Group Discussions",
  description: "Experience the next generation of group discussions with AI moderators and real-time collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <SocketProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </SocketProvider>
      </body>
    </html>
  );
}
