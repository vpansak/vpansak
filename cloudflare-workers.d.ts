declare module "cloudflare:workers" {
  export const env: {
    DB: unknown;
    BUCKET: {
      put(
        key: string,
        value: ArrayBuffer,
        options?: {
          httpMetadata?: { contentType?: string };
          customMetadata?: Record<string, string>;
        },
      ): Promise<unknown>;
    };
    RAZORPAY_KEY_ID?: string;
    RAZORPAY_KEY_SECRET?: string;
  };
}
