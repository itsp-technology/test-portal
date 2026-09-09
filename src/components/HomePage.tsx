"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { AVAILABLE_TESTS, CATEGORY_TAXONOMY } from "../data/exams";
import { ExamItem } from "../types/exam";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  X,
  Menu,
  FileText,
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
  // Non-blocking concurrent search input
  const deferredSearch = useDeferredValue(searchQuery);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("All");
    setCurrentPage(1);
    try {
      sessionStorage.setItem("portal_selected_cat", cat);
      sessionStorage.setItem("portal_selected_subcat", "All");
    } catch {}
  };

  const handleSubCategorySelect = (sub: string) => {
    setSelectedSubCategory(sub);
    setCurrentPage(1);
    try {
      sessionStorage.setItem("portal_selected_subcat", sub);
    } catch {}
  };

  const examCategories = useMemo(() => Object.keys(CATEGORY_TAXONOMY), []);
  const currentSubCategories = CATEGORY_TAXONOMY[selectedCategory] || [];

  // Instant pre-indexed filtering
  const filteredTests = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();

    return AVAILABLE_TESTS.filter((test) => {
      if (selectedCategory !== "All" && test.category !== selectedCategory) return false;

      if (
        selectedSubCategory !== "All" &&
        test.subCategory !== selectedSubCategory &&
        test.subject !== selectedSubCategory
      ) {
        return false;
      }

      if (!query) return true;

      return (
        test.title.toLowerCase().includes(query) ||
        test.subject.toLowerCase().includes(query) ||
        (test.chapter && test.chapter.toLowerCase().includes(query)) ||
        (test.subCategory && test.subCategory.toLowerCase().includes(query))
      );
    });
  }, [selectedCategory, selectedSubCategory, deferredSearch]);

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE) || 1;
  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTests, currentPage]);

  const isSubjectBoxVisible = selectedCategory !== "All" && currentSubCategories.length > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b13] text-slate-900 dark:text-slate-100 transition-colors duration-100" suppressHydrationWarning>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-4 sm:px-7 sm:py-5 shadow-sm mb-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="sm:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition cursor-pointer border border-white/10"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-lg font-black tracking-tight leading-tight">
                    Free Mock Test Portal v4
                  </h1>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-500 text-white rounded-md tracking-wider">
                    100% Free
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
                  Official pattern computer-based tests, sectionals & chapter drills
                </p>
              </div>
            </div>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search tests, topics, subjects..."
                className="w-full bg-white/10 dark:bg-slate-900/80 text-white placeholder:text-slate-400 pl-10 pr-4 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10 dark:border-slate-700 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none touch-pan-x">
          <button
            suppressHydrationWarning
            onClick={() => handleCategorySelect("All")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              selectedCategory === "All"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-[#0e1628] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162035] border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Test Papers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                selectedCategory === "All"
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#0e1628] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162035] border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? "bg-slate-800 dark:bg-blue-700 text-slate-200 dark:text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subcategory Drawer */}
        {isSubjectBoxVisible && (
          <div className="bg-white dark:bg-[#0e1628] border border-blue-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs mb-5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {selectedCategory} Subjects & Streams
                </h2>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => handleCategorySelect("All")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer active:scale-95 shadow-2xs"
                title="Clear filter and show all tests"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>Clear Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              <button
                suppressHydrationWarning
                onClick={() => handleSubCategorySelect("All")}
                className={`px-3 py-2.5 rounded-2xl text-xs font-semibold text-left transition border cursor-pointer flex items-center justify-between ${
                  selectedSubCategory === "All"
                    ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c2944]"
                }`}
              >
                <span className="truncate">All {selectedCategory}</span>
                {selectedSubCategory === "All" && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                )}
              </button>

              {currentSubCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub;
                return (
                  <button
                    suppressHydrationWarning
                    key={sub}
                    onClick={() => handleSubCategorySelect(sub)}
                    className={`px-3 py-2.5 rounded-2xl text-xs font-semibold text-left transition border cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c2944]"
                    }`}
                  >
                    <span className="truncate">{sub}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 px-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredTests.length}</strong> mock{" "}
            {filteredTests.length === 1 ? "paper" : "papers"} in{" "}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {selectedCategory === "All" ? "All Categories" : selectedCategory}
              {selectedSubCategory !== "All" ? ` > ${selectedSubCategory}` : ""}
            </span>
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Mock Test Cards */}
        {paginatedTests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedTests.map((test, idx) => (
              <div
                key={`${test.id}-${idx}`}
                className="bg-white dark:bg-[#0e1628] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md truncate max-w-[70%]">
                      {test.subCategory || test.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md">
                      Free
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 min-h-[2.6rem]">
                    {test.title}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{test.subject}</span>
                    {test.chapter && (
                      <>
                        <span>•</span>
                        <span className="truncate text-slate-400 dark:text-slate-500">{test.chapter}</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 mt-3.5 py-2 bg-slate-50 dark:bg-[#162035] border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Questions</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">{test.totalQuestions}</p>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-700">
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Duration</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">{test.durationMins}m</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Marks</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">{test.maxMarks}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => onSelectExam(test)}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    Attempt CBT Now <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0e1628] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No mock test papers found for this selection. Try selecting another stream or clearing the search.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-6 mb-2">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0e1628] text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-[#162035] transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                suppressHydrationWarning
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#0e1628] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#162035]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0e1628] text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-[#162035] transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0e1628] border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-150 select-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Exam Categories
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Theme Mode
                </span>
                <ThemeToggle />
              </div>

              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    handleCategorySelect("All");
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === "All"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162035]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>All Test Papers</span>
                  </span>
                  <span className="text-[10px] opacity-80">{AVAILABLE_TESTS.length}</span>
                </button>

                {examCategories.map((cat) => {
                  const count = AVAILABLE_TESTS.filter((t) => t.category === cat).length;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        handleCategorySelect(cat);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162035]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{cat}</span>
                      </span>
                      <span className="text-[10px] opacity-80">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3 text-center font-medium">
              Free Mock Test Portal v1
            </div>
          </div>
        </div>
      )}
    </div>
  );
};