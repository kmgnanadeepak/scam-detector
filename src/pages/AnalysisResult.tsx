import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";
import TrustScoreGauge from "@/components/TrustScoreGauge";
import type { AnalysisResult as AnalysisResultType } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

const AnalysisResult = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      // Simulate brief loading for smooth transition
      setTimeout(() => {
        setResult(JSON.parse(stored));
        setLoading(false);
      }, 600);
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-blobs">
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-12 page-enter">
        {/* Back button & title */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="glass-input rounded-2xl p-2.5 text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Analysis Results
            </h1>
            {result && (
              <p className="text-sm text-muted-foreground mt-1">
                Results for <span className="text-primary font-medium">{result.company.name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Review Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">
              Review Intelligence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <>
                  <ReviewCard loading />
                  <ReviewCard loading />
                  <ReviewCard loading />
                  <ReviewCard loading />
                </>
              ) : (
                result?.reviews.map((review) => (
                  <ReviewCard key={review.platform} data={review} />
                ))
              )}
            </div>
          </div>

          {/* Right: Trust Score */}
          <div className="lg:col-span-1">
            <TrustScoreGauge
              data={result?.trustScore ?? null}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalysisResult;
