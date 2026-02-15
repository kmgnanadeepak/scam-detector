import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment: "positive" | "neutral" | "negative";
}

const SentimentBadge = ({ sentiment }: SentimentBadgeProps) => {
  const config = {
    positive: { icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Positive" },
    neutral: { icon: Minus, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Neutral" },
    negative: { icon: TrendingDown, color: "text-red-500 bg-red-50 border-red-200", label: "Negative" },
  };

  const { icon: Icon, color, label } = config[sentiment];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium", color)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
};

export default SentimentBadge;
