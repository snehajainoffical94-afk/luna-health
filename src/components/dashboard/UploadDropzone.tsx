"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onSuccess?: (uploadId: string) => void;
}

export default function UploadDropzone({ onSuccess }: UploadDropzoneProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/*": [".jpg", ".jpeg", ".png"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      toast({ title: "Upload successful!", description: "Processing your report with OCR..." });
      setUploading(false);
      setProcessing(true);

      // Trigger OCR processing
      const ocrRes = await fetch("/api/ocr/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: data.uploadId }),
      });
      const ocrData = await ocrRes.json();

      if (!ocrRes.ok) throw new Error(ocrData.error ?? "OCR failed");

      setProcessing(false);
      setDone(true);
      toast({ title: "Report processed!", description: `Extracted ${ocrData.biomarkerCount ?? 0} biomarkers.` });
      onSuccess?.(data.uploadId);
    } catch (err: unknown) {
      setUploading(false);
      setProcessing(false);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  if (done) return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-xl font-bold mb-2">Report Processed!</h3>
      <p className="text-white/40 text-sm mb-6">Your biomarkers have been extracted and saved.</p>
      <div className="flex gap-3 justify-center">
        <Button variant="gold" onClick={() => { setFile(null); setDone(false); }}>Upload Another</Button>
        <Button variant="outline" onClick={() => window.location.href = "/biomarkers"}>View Biomarkers</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
          isDragActive ? "border-luna-purple bg-luna-purple/5" : "border-white/10 hover:border-white/20 hover:bg-white/2"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-3 mb-3 text-white/30">
          <FileText className="w-8 h-8" />
          <span className="text-2xl">+</span>
          <Image className="w-8 h-8" />
        </div>
        {isDragActive ? (
          <p className="text-luna-purple-light font-medium">Drop your report here</p>
        ) : (
          <>
            <p className="text-white/60 font-medium mb-1">Drag & drop your report here</p>
            <p className="text-white/30 text-sm">PDF or image (JPG, PNG) · Max 10MB</p>
          </>
        )}
      </div>

      {file && (
        <div className="flex items-center gap-3 p-4 glass rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-luna-purple/10 flex items-center justify-center">
            {file.type === "application/pdf" ? <FileText className="w-4 h-4 text-luna-purple-light" /> : <Image className="w-4 h-4 text-luna-gold" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB · {file.type}</p>
          </div>
          <button onClick={() => setFile(null)} className="text-white/30 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Button
        variant="gold"
        size="lg"
        className="w-full gap-2"
        onClick={handleUpload}
        disabled={!file || uploading || processing}
      >
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> :
         processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing OCR...</> :
         <><Upload className="w-4 h-4" /> Upload & Analyse Report</>}
      </Button>
    </div>
  );
}
