// Global type declarations and module augmentations

declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    text(text: string, x: number, y: number): void;
    save(filename: string): void;
    output(type?: string): any;
  }
}

declare module 'jspdf-autotable' {
  export function autoTable(doc: any, options: any): void;
  export default function(doc: any, options: any): void;
}

// Ensure these modules are treated as optional
declare module '@/lib/pdf-generator' {
  export function generatePDF(data: any, options?: any): Promise<Buffer>;
  export function generatePentestReport(pentestId: string): Promise<Buffer>;
  export function generateVulnerabilityReport(findings: any[]): Promise<Buffer>;
  export function htmlToPDF(html: string, options?: any): Promise<Buffer>;
}

// Export types to make this a module
export {};
