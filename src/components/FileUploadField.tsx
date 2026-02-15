import { useRef, useState } from "react";
import { Upload, FileText, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  label: string;
  accept: string;
  icon?: "image" | "pdf";
  onChange?: (file: File | null) => void;
}

const FileUploadField = ({ label, accept, icon = "image", onChange }: FileUploadFieldProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    onChange?.(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const Icon = icon === "pdf" ? FileText : Image;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/70">{label}</label>
      <div
        className={cn(
          "glass-input rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 border-dashed border-2",
          dragOver ? "border-primary bg-primary/5" : "border-border/50",
          file && "border-primary/30"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Icon className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm text-foreground/70 truncate">{file.name}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleFile(null); }}
              className="p-1 rounded-full hover:bg-foreground/5 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click or drag to upload
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadField;
