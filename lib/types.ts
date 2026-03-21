// This file can be used to define global types for the frontend application.

// By declaring this interface, we inform TypeScript that we expect
// to find a `MizanCustomSlideProps` property on the global `window` object.
// This is injected by the MizanTV app's WebView.
declare global {
  interface Window {
    MizanCustomSlideProps?: {
      slide: any;
      masjid?: any;
      theme: any;
    };
  }
}

// To make this file a module and allow global declarations, we need to export something.
export {}; 