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
    "px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ";

  if (variant === "default")
    base += "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:from-cyan-400 hover:to-blue-500 border border-transparent ";
  else if (variant === "outline")
    base +=
      "bg-transparent border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:bg-cyan-950/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:border-cyan-400 backdrop-blur-sm ";
  else if (variant === "destructive")
    base += "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] hover:from-red-500 hover:to-pink-500 ";

  return <button className={base + className} {...props} />;
}
