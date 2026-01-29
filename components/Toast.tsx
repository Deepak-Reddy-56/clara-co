"use client";

import { CheckCircle } from "lucide-react";

export default function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      className={`fixed top-6 right-6 z-[100] transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-white text-gray-900 px-5 py-3 rounded-xl shadow-xl border border-gray-200">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
