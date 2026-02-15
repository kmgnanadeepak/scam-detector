import { useMemo } from "react";
import GlassCard from "./GlassCard";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustScore } from "@/lib/api";

interface TrustScoreGaugeProps {
  data: TrustScore | null;
  loading?: boolean;
}

const TrustScoreGauge = ({ data, loading }: TrustScoreGaugeProps) => {
  const circumference = 2 * Math.PI * 52;
  const offset = data ? circumference - (data.score / 100) * circumference : circumference;

  const scoreColor = useMemo(() => {
    if (!data) return "text-muted-foreground";
    if (data.score >= 70) return "text-primary";
    if (data.score >= 40) return "text-amber-500";
    return "text-red-500";
  }, [data]);

  const strokeColor = useMemo(() => {
    if (!data) return "stroke-muted";
    if (data.score >= 70) return "stroke-primary";
    if (data.score >= 40) return "stroke-amber-500";
    return "stroke-red-500";
  }, [data]);

  const riskBadge = useMemo(() => {
    if (!data) return null;
    const map: Record<string, { icon: typeof Shield; color: string }> = {
      Low: { icon: ShieldCheck, color: "text-emerald-600 border-emerald-200 bg-emerald-50" },
      Medium: { icon: Shield, color: "text-amber-600 border-amber-200 bg-amber-50" },
      High: { icon: ShieldAlert, color: "text-orange-500 border-orange-200 bg-orange-50" },
      Critical: { icon: AlertTriangle, color: "text-red-500 border-red-200 bg-red-50" },
    };
    return map[data.riskLevel] || map.Medium;
  }, [data]);

  if (loading) {
    return (
      <GlassCard className="animate-pulse" hover={false}>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-32 h-32 rounded-full shimmer" />
          <div className="h-6 w-24 rounded shimmer" />
          <div className="h-4 w-32 rounded shimmer" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow={data && data.score >= 70 ? "cyan" : "none"} className="sticky top-24">
      <h3 className="text-lg font-display font-semibold text-foreground mb-6 text-center">
        Trust Score
      </h3>

      <div className="flex flex-col items-center gap-5">
        {/* Circular gauge */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              strokeWidth="8"
              className="stroke-border/30"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn(strokeColor, "transition-all duration-1000 ease-out")}
              style={{ filter: data && data.score >= 70 ? "drop-shadow(0 0 8px hsl(187 70% 48% / 0.4))" : undefined }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-4xl font-display font-bold", scoreColor)}>
              {data ? data.score : "—"}
            </span>
          </div>
        </div>

        {/* Risk badge */}
        {data && riskBadge && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
            riskBadge.color
          )}>
            <riskBadge.icon className="w-4 h-4" />
            {data.riskLevel} Risk
          </div>
        )}

        {/* Quick indicators */}
        {data && (
          <div className="w-full space-y-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Verified Recruiter</span>
              <span className={data.verifiedRecruiter ? "text-emerald-600 font-medium" : "text-red-500"}>
                {data.verifiedRecruiter ? "Yes ✓" : "No ✗"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scam Reports</span>
              <span className={cn(
                data.scamReports > 5 ? "text-red-500" : "text-foreground/70"
              )}>
                {data.scamReports}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Domain Age</span>
              <span className="text-foreground/70">{data.domainAge}</span>
            </div>
          </div>
        )}

        {!data && (
          <p className="text-sm text-muted-foreground text-center">
            Analyze a company to see trust score
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default TrustScoreGauge;
