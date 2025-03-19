declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string;
    numpages: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: any;
    version: string;
  }

  function parse(dataBuffer: Buffer | Uint8Array, options?: any): Promise<PDFParseResult>;
  
  export = parse;
} 