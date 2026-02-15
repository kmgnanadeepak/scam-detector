import GlassCard from "./GlassCard";
import SentimentBadge from "./SentimentBadge";
import SkeletonLoader from "./SkeletonLoader";
import { Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewData } from "@/lib/api";

const platformIcons: Record<string, string> = {
  Google: "🔍",
  Facebook: "📘",
  Reddit: "🟠",
  YouTube: "▶️",
};

interface ReviewCardProps {
  data?: ReviewData;
  loading?: boolean;
}

const ReviewCard = ({ data, loading }: ReviewCardProps) => {
  if (loading) {
    return (
      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl shimmer" />
          <div className="h-5 w-24 rounded shimmer" />
        </div>
        <SkeletonLoader lines={4} />
      </GlassCard>
    );
  }

  if (!data) return null;

  return (
    <GlassCard className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{platformIcons[data.platform] || "🌐"}</span>
          <h3 className="font-display font-semibold text-foreground">
            {data.platform}
          </h3>
        </div>
        <SentimentBadge sentiment={data.sentiment} />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                star <= Math.round(data.rating) ? "text-amber-400 fill-amber-400" : "text-border"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {data.rating.toFixed(1)} · {data.totalMentions} mentions
        </span>
      </div>

      {/* Snippets */}
      <ul className="space-y-2 flex-1">
        {data.snippets.map((snippet, i) => (
          <li key={i} className="text-sm text-foreground/60 flex gap-2">
            <span className="text-primary/50 shrink-0">•</span>
            {snippet}
          </li>
        ))}
      </ul>

      {/* View Detailed Reviews */}
      <div className="mt-4 pt-3 border-t border-border/30 flex justify-end">
        <a
          href={data.reviewLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-300",
            "glass-input text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(187_70%_48%/0.2)]"
          )}
        >
          View Detailed Reviews
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </GlassCard>
  );
};

export default ReviewCard;
