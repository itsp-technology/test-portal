"use client";

import dynamic from "next/dynamic";

const ExamPortal = dynamic(
  () => import("@/components/ExamPortal").then((mod) => mod.ExamPortal),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#f8fafc]" />,
  }
);

export default function Page() {
  return <ExamPortal />;
}