/**
 * Utility to trigger browser downloads for report files.
 * Supports blob-backed files using ExternalBlob for direct URL downloads.
 */

export function downloadReportFile(blob: Uint8Array, filename: string, mimeType: string) {
  const blobObj = new Blob([blob as any], { type: mimeType });
  const url = URL.createObjectURL(blobObj);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function getMimeTypeForFormat(format: string): string {
  switch (format.toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}

export function generateFilename(reportType: string, format: string, date: Date): string {
  const dateStr = date.toISOString().split('T')[0];
  return `${reportType}-report-${dateStr}.${format}`;
}
