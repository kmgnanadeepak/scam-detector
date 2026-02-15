import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Globe, Building2, Loader2, AlertCircle } from "lucide-react";
import GlassCard from "./GlassCard";
import FileUploadField from "./FileUploadField";
import { fetchCompanyDetails, analyzeCompany, uploadFileWithOCR, type CompanyDetails, type UploadedFile } from "@/lib/api";
import { cn } from "@/lib/utils";

const AnalyzeForm = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [fetchingCompany, setFetchingCompany] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [manualDetails, setManualDetails] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [extractedText, setExtractedText] = useState<string>("");

  const handleCompanySearch = async () => {
    if (!companyName.trim() || fetchingCompany) return;
    setFetchingCompany(true);
    setError(null);
    try {
      const details = await fetchCompanyDetails(companyName);
      setCompanyDetails(details);
    } catch (err) {
      console.error('Failed to fetch company details:', err);
      // Don't show error for company search, just continue
    } finally {
      setFetchingCompany(false);
    }
  };

  const hasInputData = companyName.trim() || screenshot || offerLetter || manualDetails.trim() || websiteUrl.trim();

  const handleSubmit = async () => {
    if (!hasInputData || analyzing) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      // Process uploaded files with OCR first to potentially extract company name
      let finalCompanyName = companyName.trim();
      let allUploadedFiles: UploadedFile[] = [];
      let allExtractedText = extractedText;
      
      if (screenshot) {
        const ocrResult = await uploadFileWithOCR(screenshot);
        allUploadedFiles.push(ocrResult.file);
        
        // Use OCR extracted company name if we don't have one
        if (!finalCompanyName && ocrResult.ocr.primaryCompany) {
          finalCompanyName = ocrResult.ocr.primaryCompany;
        }
        
        if (ocrResult.ocr.text) {
          allExtractedText += '\n' + ocrResult.ocr.text;
        }
      }
      
      if (offerLetter) {
        const ocrResult = await uploadFileWithOCR(offerLetter);
        allUploadedFiles.push(ocrResult.file);
        
        // Use OCR extracted company name if we still don't have one
        if (!finalCompanyName && ocrResult.ocr.primaryCompany) {
          finalCompanyName = ocrResult.ocr.primaryCompany;
        }
        
        if (ocrResult.ocr.text) {
          allExtractedText += '\n' + ocrResult.ocr.text;
        }
      }
      
      // If we still don't have a company name, try to extract it from manual details
      if (!finalCompanyName && manualDetails.trim()) {
        // Simple regex to find company names in text
        const companyPatterns = [
          /(?:company|organization|corporation|inc|llc|ltd|pvt|private)\s+[:\-]?\s*([A-Za-z0-9\s&.,'-]+?)(?:\n|$|\.|,)/gi,
          /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s+inc|llc|ltd|corp|corporation)?/m,
        ];
        
        for (const pattern of companyPatterns) {
          const match = manualDetails.match(pattern);
          if (match && match[1]) {
            finalCompanyName = match[1].trim();
            break;
          }
        }
      }
      
      // If still no company name, use a generic one
      if (!finalCompanyName) {
        finalCompanyName = "Unknown Company";
      }
      
      // Analyze company with all available data
      const result = await analyzeCompany(
        finalCompanyName,
        websiteUrl || undefined,
        manualDetails || undefined,
        allUploadedFiles,
        allExtractedText || undefined
      );
      
      // Store result for the results page
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      navigate("/analysis-result");
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  return (
    <GlassCard className="glass-strong max-w-2xl mx-auto" hover={false}>
      <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
        <Search className="w-6 h-6 text-primary" />
        Analyze Company
      </h2>

      <div className="space-y-5">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">Company Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCompanySearch()}
              placeholder="Enter company name..."
              className="flex-1 glass-input rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={handleCompanySearch}
              disabled={fetchingCompany || !companyName.trim()}
              className="glass-input rounded-2xl px-4 py-3 text-primary hover:bg-primary/5 transition-all disabled:opacity-50"
            >
              {fetchingCompany ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {companyDetails && (
            <div className="glass-input rounded-2xl p-4 flex items-center gap-4 mt-2">
              <img
                src={companyDetails.logo}
                alt={companyDetails.name}
                className="w-12 h-12 rounded-2xl"
              />
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{companyDetails.name}</p>
                <p className="text-sm text-primary truncate">{companyDetails.website}</p>
                <p className="text-xs text-muted-foreground truncate">{companyDetails.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* File uploads */}
        <FileUploadField
          label="Upload Screenshot (Email / Message)"
          accept="image/png,image/jpg,image/jpeg"
          icon="image"
          onChange={(file) => {
            setScreenshot(file);
            if (file) setError(null);
          }}
        />

        <FileUploadField
          label="Upload Offer Letter (PDF)"
          accept="application/pdf"
          icon="pdf"
          onChange={(file) => {
            setOfferLetter(file);
            if (file) setError(null);
          }}
        />

        {/* Manual Details */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">Manual Details</label>
          <textarea
            value={manualDetails}
            onChange={(e) => setManualDetails(e.target.value)}
            placeholder="Paste internship or company details"
            rows={4}
            className="w-full glass-input rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none resize-none"
          />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">Website URL (optional)</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full glass-input rounded-2xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-input rounded-2xl p-4 flex items-start gap-3 border border-red-500/30 bg-red-500/5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleSubmit}
          disabled={!hasInputData || analyzing}
          className={cn(
            "w-full py-4 rounded-3xl font-display font-semibold text-lg transition-all duration-300",
            "bg-gradient-to-r from-primary/20 to-secondary/20",
            "border border-primary/30 text-foreground",
            "hover:from-primary/30 hover:to-secondary/30 hover:border-primary/50",
            "animate-pulse-glow",
            "disabled:opacity-50 disabled:animate-none disabled:cursor-not-allowed"
          )}
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5" />
              Analyze Company
            </span>
          )}
        </button>
      </div>
    </GlassCard>
  );
};

export default AnalyzeForm;
