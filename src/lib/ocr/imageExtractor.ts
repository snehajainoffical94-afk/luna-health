// =============================================
// LUNA HEALTH — Image OCR Extractor
// Uses Tesseract.js for image-to-text
// =============================================

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const worker = await Tesseract.createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return data.text ?? "";
  } finally {
    await worker.terminate();
  }
}
