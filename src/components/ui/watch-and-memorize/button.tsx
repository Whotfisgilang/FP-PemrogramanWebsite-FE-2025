import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
}

export default function Button({
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  let base =
    "px-4 py-2 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ";

  if (variant === "default")
    base += "bg-emerald-600 text-white hover:bg-emerald-700 ";
  else if (variant === "outline")
    base +=
      "border border-slate-600 text-slate-200 hover:bg-slate-700/30 backdrop-blur ";
  else if (variant === "destructive")
    base += "bg-red-600 text-white hover:bg-red-700 ";

  return <button className={base + className} {...props} />;
}
