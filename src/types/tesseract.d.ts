declare module "tesseract.js" {
  interface RecognizeResult {
    data: { text: string };
  }
  interface Worker {
    recognize(image: Buffer | string): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }
  export function createWorker(lang: string): Promise<Worker>;
}
