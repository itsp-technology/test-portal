import "./globals.css";
import "katex/dist/katex.min.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discrete Mathematics CBT Mock",
  description: "CBT Mock Test Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f0f4f8] text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}