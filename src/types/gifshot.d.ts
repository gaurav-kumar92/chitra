declare module 'gifshot' {
    const gifshot: {
      createGIF: (
        options: {
          images: string[];
          gifWidth?: number;
          gifHeight?: number;
          frameDuration?: number;
          numFrames?: number;
          interval?: number;
          sampleInterval?: number;
          transparent?: string;
          background?: string;
          progressCallback?: (captureProgress: number) => void;
        },
        callback: (result: {
          error: boolean;
          errorCode?: string;
          errorMsg?: string;
          image: string;
        }) => void
      ) => void;
    };
  
    export default gifshot;
  }
  