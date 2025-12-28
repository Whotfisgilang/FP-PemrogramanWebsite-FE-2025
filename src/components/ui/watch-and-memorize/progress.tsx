import React from "react";

interface ProgressProps {
  value: number; // 0 - 100
  className?: string;
}

export default function Progress({ value, className = "" }: ProgressProps) {
  return (
    <div
      className={
        "w-full bg-slate-900/80 h-4 rounded-full overflow-hidden border border-slate-700/50 shadow-inner " +
        className
      }
    >
      <div
        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.6)]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
