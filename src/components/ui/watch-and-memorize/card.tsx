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
        "rounded-xl bg-slate-900 border border-slate-700 p-4 shadow-md " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
