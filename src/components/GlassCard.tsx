import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "cyan" | "purple" | "gold" | "none";
}

const GlassCard = ({ children, className, hover = true, glow = "none" }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass rounded-3xl p-6",
        hover && "hover:scale-[1.01]",
        glow === "cyan" && "glow-aqua",
        glow === "purple" && "glow-purple",
        glow === "gold" && "glow-gold",
        "transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
