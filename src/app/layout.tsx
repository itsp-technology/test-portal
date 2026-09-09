import "./globals.css";
import "katex/dist/katex.min.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Mock Test Portal - Computer Based Test Series",
  description: "Official pattern computer-based tests, sectionals & chapter drills",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f8fafc] text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}