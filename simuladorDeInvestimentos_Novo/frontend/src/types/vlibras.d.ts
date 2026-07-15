export {};

declare global {
  interface Window {
    VLibras?: {
      Widget: new (appUrl: string) => unknown;
    };
  }
}
