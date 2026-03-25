import UploadDropzone from "@/components/dashboard/UploadDropzone";
import { FileText, Send, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">Upload Report</h1>
        <p className="text-white/40 text-sm">Upload your blood test report or any health document for AI analysis.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main upload */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-luna-gold" /> Upload via Website
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadDropzone />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Telegram */}
          <Card className="border-luna-purple/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Send className="w-4 h-4 text-luna-purple-light" /> Upload via Telegram
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-white/50 space-y-2">
              <p>You can also send your reports directly to our Telegram bot.</p>
              <ol className="list-decimal list-inside space-y-1.5 text-white/40">
                <li>Open Telegram</li>
                <li>Search <strong className="text-white/60">@LunaHealthBot</strong></li>
                <li>Send /start</li>
                <li>Upload your PDF or photo</li>
              </ol>
              <p className="text-luna-purple-light mt-2">Connect your Telegram in Settings to link uploads to your account.</p>
            </CardContent>
          </Card>

          {/* Supported */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-white/40" /> Supported Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-white/50 space-y-1">
              {[
                "Complete Blood Count (CBC)",
                "Lipid Panel",
                "Thyroid (TSH, T3, T4)",
                "Vitamin D, B12, Folate",
                "Iron, Ferritin, TIBC",
                "Liver Function (LFT)",
                "Kidney Function (KFT)",
                "HbA1c, Blood Glucose",
                "Inflammation (CRP, ESR)",
                "Hormones (Cortisol, etc.)",
              ].map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-luna-gold" />
                  <span>{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
