import Navbar from "@/components/Navbar";
import AnalyzeForm from "@/components/AnalyzeForm";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-blobs">
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-12 page-enter">
        {/* Hero tagline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            Verify Before You <span className="neon-text-cyan">Trust</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze companies and internship offers for legitimacy using AI-powered trust scoring
          </p>
        </div>

        <AnalyzeForm />
      </main>
    </div>
  );
};

export default Index;
