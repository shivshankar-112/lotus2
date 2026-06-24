import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ReduxProvider from "./providers/ReduxProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Gaming Platform",
  description: "Color prediction gaming platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        inter.variable,
        jetbrainsMono.variable
      )}
    >
      <body
        className="min-h-full bg-black text-white font-sans"
        cz-shortcut-listen="true" // only for sevelopment mode
      >
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster/>
      </body>
    </html>
  );
}
