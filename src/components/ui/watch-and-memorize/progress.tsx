import React from "react";

interface ProgressProps {
  value: number; // 0 - 100
  className?: string;
}

export default function Progress({ value, className = "" }: ProgressProps) {
  return (
    <div
      className={
        "w-full bg-slate-800 h-3 rounded-full overflow-hidden " + className
      }
    >
      <div
        className="bg-emerald-500 h-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
