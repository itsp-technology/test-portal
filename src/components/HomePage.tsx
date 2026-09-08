"use client";

import React, { useState, useMemo } from "react";
import { AVAILABLE_TESTS, CATEGORY_TAXONOMY } from "../data/exams";
import { ExamItem } from "../types/exam";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";

interface HomePageProps {
  onSelectExam: (exam: ExamItem) => void;
}

const ITEMS_PER_PAGE = 12;

export const HomePage: React.FC<HomePageProps> = ({ onSelectExam }) => {
  // Default to "All" so students can see all papers right away
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const examCategories = Object.keys(CATEGORY_TAXONOMY);

  // Derive subcategory pills based on chosen exam
  const currentSubCategories = useMemo(() => {
    if (selectedCategory === "All") {
      // Gather all subjects across all exams for quick filtering
      const uniqueSubs = new Set<string>();
      AVAILABLE_TESTS.forEach((t) => {
        if (t.subCategory) uniqueSubs.add(t.subCategory);
        if (t.subject) uniqueSubs.add(t.subject);
      });
      return Array.from(uniqueSubs).slice(0, 9);
    }
    return CATEGORY_TAXONOMY[selectedCategory] || [];
  }, [selectedCategory]);

  // Main filter
  const filteredTests = useMemo(() => {
    return AVAILABLE_TESTS.filter((test) => {
      const matchCategory =
        selectedCategory === "All" || test.category === selectedCategory;

      const matchSubCategory =
        selectedSubCategory === "All" ||
        test.subCategory === selectedSubCategory ||
        test.subject === selectedSubCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        test.title.toLowerCase().includes(query) ||
        test.subject.toLowerCase().includes(query) ||
        (test.chapter && test.chapter.toLowerCase().includes(query)) ||
        (test.subCategory && test.subCategory.toLowerCase().includes(query));

      return matchCategory && matchSubCategory && matchSearch;
    });
  }, [selectedCategory, selectedSubCategory, searchQuery]);

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE) || 1;
  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTests, currentPage]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 shadow-xs mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                National Mock Test Portal
              </h1>
              <p className="text-[10px] text-slate-300">
                Official pattern computer-based tests, sectionals & chapter drills
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search tests, topics, subjects..."
              className="w-full bg-white text-slate-900 pl-8.5 pr-3 py-1.5 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* Sidebar + Subject Grid Selection Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mb-4 flex flex-col md:flex-row min-h-[220px]">
          {/* Left Vertical Category List */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none">
            {/* 1. All Test Papers Option */}
            <button
              onClick={() => handleCategorySelect("All")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>All Test Papers</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === "All"
                    ? "bg-blue-700 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {AVAILABLE_TESTS.length}
              </span>
            </button>

            {/* Exam Categories */}
            {examCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = AVAILABLE_TESTS.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-blue-600 shadow-xs border-l-4 border-blue-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{cat}</span>
                  <div className="flex items-center gap-1.5">
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-semibold">
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 hidden md:block text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Sub-Category / Stream Options Box */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {selectedCategory === "All"
                      ? "Popular Streams & Subjects"
                      : `${selectedCategory} Subjects & Streams`}
                  </h2>
                </div>
                {selectedSubCategory !== "All" && (
                  <button
                    onClick={() => {
                      setSelectedSubCategory("All");
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset to All {selectedCategory} Papers
                  </button>
                )}
              </div>

              {/* 3-Column Subcategory Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setSelectedSubCategory("All");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border cursor-pointer flex items-center justify-between ${
                    selectedSubCategory === "All"
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>All Papers</span>
                  {selectedSubCategory === "All" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </button>

                {currentSubCategories.map((sub) => {
                  const isSelected = selectedSubCategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSubCategory(sub);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-700 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{sub}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-3">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Select any subject or category to narrow down mock tests and chapter drills below.
              </span>
            </div>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2.5 px-1">
          <span>
            Showing <strong className="text-slate-800">{filteredTests.length}</strong> mock{" "}
            {filteredTests.length === 1 ? "paper" : "papers"} in{" "}
            <span className="text-blue-600 font-bold">
              {selectedCategory === "All" ? "All Categories" : selectedCategory}
              {selectedSubCategory !== "All" ? ` > ${selectedSubCategory}` : ""}
            </span>
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* 3 Mock Test Cards Per Row Grid */}
        {paginatedTests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedTests.map((test, idx) => (
              <div
                key={`${test.id}-${idx}`}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {test.subCategory || test.category}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      Free
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 min-h-[2.4rem]">
                    {test.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium truncate">
                    <span className="font-semibold text-slate-700">{test.subject}</span>
                    {test.chapter && (
                      <>
                        <span>•</span>
                        <span className="truncate text-slate-400">{test.chapter}</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-0.5 mt-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <div>
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase">Questions</p>
                      <p className="text-xs font-black text-slate-800">{test.totalQuestions}</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase">Duration</p>
                      <p className="text-xs font-black text-slate-800">{test.durationMins}m</p>
                    </div>
                    <div>
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase">Marks</p>
                      <p className="text-xs font-black text-slate-800">{test.maxMarks}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectExam(test)}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    Attempt CBT Now <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No mock test papers found for this selection. Try selecting &quot;All Papers&quot; or clearing your search.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-5 mb-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition cursor-pointer ${
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
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};