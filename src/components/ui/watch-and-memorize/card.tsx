import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={
        "rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50 " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
