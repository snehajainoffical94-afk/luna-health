// =============================================
// LUNA HEALTH — PDF Text Extractor
// Uses pdf-parse to extract raw text from PDF buffers
// =============================================

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamically import to avoid SSR issues
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text ?? "";
}
