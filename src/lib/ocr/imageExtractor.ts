// =============================================
// LUNA HEALTH — Image OCR Extractor
// Uses Tesseract.js for image-to-text
// =============================================

import { createWorker } from "tesseract.js";

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return data.text ?? "";
  } finally {
    await worker.terminate();
  }
}
