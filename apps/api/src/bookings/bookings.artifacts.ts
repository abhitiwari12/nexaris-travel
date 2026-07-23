import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingArtifactsService {
  pdfBase64(title: string, lines: string[]): string {
    const text = [title, ...lines].join('\\n').replace(/[()]/g, '');
    const stream = `BT /F1 14 Tf 72 740 Td (${text}) Tj ET`;
    const pdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\nxref\n0 6\n0000000000 65535 f \ntrailer << /Root 1 0 R /Size 6 >>\nstartxref\n0\n%%EOF`;
    return Buffer.from(pdf).toString('base64');
  }
}
