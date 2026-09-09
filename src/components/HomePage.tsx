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
  X,
} from "lucide-react";

interface HomePageProps {
  onSelectExam: (exam: ExamItem) => void;
}

const ITEMS_PER_PAGE = 12;

export const HomePage: React.FC<HomePageProps> = ({ onSelectExam }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("portal_selected_cat") || "All";
    }
    return "All";
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("portal_selected_subcat") || "All";
    }
    return "All";
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("All");
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("portal_selected_cat", cat);
      sessionStorage.setItem("portal_selected_subcat", "All");
    }
  };

  const handleSubCategorySelect = (sub: string) => {
    setSelectedSubCategory(sub);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("portal_selected_subcat", sub);
    }
  };

  const examCategories = Object.keys(CATEGORY_TAXONOMY);
  const currentSubCategories = CATEGORY_TAXONOMY[selectedCategory] || [];

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

  const isSubjectBoxVisible = selectedCategory !== "All" && currentSubCategories.length > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800" suppressHydrationWarning>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 shadow-xs mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                  Free Mock Test Portal
                </h1>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-500 text-white rounded-md tracking-wider">
                  100% Free
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Free official pattern computer-based tests, sectionals & chapter drills
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

        {/* Touch-Friendly Category Tabs (Mobile Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none touch-pan-x">
          <button
            suppressHydrationWarning
            onClick={() => handleCategorySelect("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
              selectedCategory === "All"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Test Papers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                selectedCategory === "All"
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {AVAILABLE_TESTS.length}
            </span>
          </button>

          {examCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = AVAILABLE_TESTS.filter((t) => t.category === cat).length;
            return (
              <button
                suppressHydrationWarning
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-Category/Stream Drawer */}
        {isSubjectBoxVisible && (
          <div className="bg-white border border-blue-200/80 rounded-2xl p-3.5 sm:p-5 shadow-xs mb-3 sm:mb-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {selectedCategory} Subjects & Streams
                </h2>
              </div>
                <button
                  suppressHydrationWarning
                  onClick={() => handleCategorySelect("All")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Clear filter and show all tests"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>Clear Filter</span>
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                suppressHydrationWarning
                onClick={() => handleSubCategorySelect("All")}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-left transition border cursor-pointer flex items-center justify-between ${
                  selectedSubCategory === "All"
                    ? "border-blue-600 bg-blue-50/70 text-blue-700 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">All {selectedCategory}</span>
                {selectedSubCategory === "All" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                )}
              </button>

              {currentSubCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub;
                return (
                  <button
                    suppressHydrationWarning
                    key={sub}
                    onClick={() => handleSubCategorySelect(sub)}
                    className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-left transition border cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-700 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{sub}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium mb-2.5 px-1">
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
                    <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md truncate max-w-[70%]">
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
                    suppressHydrationWarning
                    onClick={() => onSelectExam(test)}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    Attempt CBT Now <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-xs">
            No mock test papers found for this selection. Try selecting another stream or clearing the search.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-5 mb-2">
            <button
              suppressHydrationWarning
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                suppressHydrationWarning
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
              suppressHydrationWarning
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};