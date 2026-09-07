"use client";

import React, { useState, useMemo } from "react";
import { AVAILABLE_TESTS } from "../data/exams";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";

type ExamItem = (typeof AVAILABLE_TESTS)[number];

interface HomePageProps {
  onSelectExam: (exam: ExamItem) => void;
}

// 12 items per page = exactly 4 rows of 3 cards
const ITEMS_PER_PAGE = 12;

export const HomePage: React.FC<HomePageProps> = ({ onSelectExam }) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredTests = useMemo(() => {
    return AVAILABLE_TESTS.filter((test) => {
      const matchCat = activeCategory === "All" || test.category === activeCategory;
      const matchSearch =
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE) || 1;
  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTests, currentPage]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800">
      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-3">
        {/* Compact Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-xs mb-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-sm font-black tracking-tight text-white">
                Mock Test Portal
              </h1>
              <p className="text-[10px] text-slate-300 leading-tight">
                Online computer-based test series with authentic patterns.
              </p>
            </div>

            {/* Compact Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search mock tests..."
                className="w-full bg-white text-slate-900 pl-7 pr-2.5 py-1 rounded-lg text-[11px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 scrollbar-none">
          {["All", "GATE", "UPSC", "SSC CGL", "JEE", "Defence"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-2 px-1">
          <span>
            Showing <strong className="text-slate-800">{paginatedTests.length}</strong> of{" "}
            <strong className="text-slate-800">{filteredTests.length}</strong> tests
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* 3 Cards Per Row Grid */}
        {paginatedTests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {paginatedTests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                      {test.category}
                    </span>
                    <span className="text-[8px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      Free
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <h2 className="font-bold text-xs text-slate-900 leading-tight line-clamp-2 min-h-[2rem]">
                    {test.title}
                  </h2>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5 truncate">
                    {test.subject}
                  </p>

                  {/* Shrunk Metrics Bar */}
                  <div className="grid grid-cols-3 gap-0.5 mt-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-center">
                    <div>
                      <p className="text-[7px] text-slate-400 font-bold uppercase">Questions</p>
                      <p className="text-[11px] font-black text-slate-800">{test.totalQuestions}</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <p className="text-[7px] text-slate-400 font-bold uppercase">Duration</p>
                      <p className="text-[11px] font-black text-slate-800">{test.durationMins}m</p>
                    </div>
                    <div>
                      <p className="text-[7px] text-slate-400 font-bold uppercase">Marks</p>
                      <p className="text-[11px] font-black text-slate-800">{test.maxMarks}</p>
                    </div>
                  </div>
                </div>

                {/* Compact Action Button */}
                <div className="mt-2 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => onSelectExam(test)}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-1 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    Attempt CBT Now <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
            No test papers found matching your criteria.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-4 mb-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-slate-200 rounded-md bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-6 w-6 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-slate-200 rounded-md bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};