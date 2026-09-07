import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "CBT Exam Engine - Discrete Mathematics",
  description: "Next-gen test portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Instant Tailwind CDN - Guarantees styles work immediately */}
        <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
        {/* KaTeX Math Styling */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}