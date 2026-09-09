"use client";

import React from "react";
import { LogOut, Send, RotateCw } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  type: "exit" | "submit" | "reload";
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmText,
  cancelText = "Stay in Exam",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isExit = type === "exit";
  const isReload = type === "reload";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isExit
                ? "bg-rose-50 text-rose-600"
                : isReload
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {isExit && <LogOut className="w-5 h-5" />}
            {isReload && <RotateCw className="w-5 h-5" />}
            {type === "submit" && <Send className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-xs active:scale-95 transition cursor-pointer ${
              isExit
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                : isReload
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};