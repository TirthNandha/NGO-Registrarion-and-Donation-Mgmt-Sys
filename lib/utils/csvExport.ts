/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Converts an array of data to CSV format and triggers download
 * @param headers - Array of column headers
 * @param rows - 2D array of row data
 * @param filename - Name of the downloaded file (without .csv extension)
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string
): void {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Formats a date for CSV export in DD/MM/YYYY format
 */
export function formatDateForCSV(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB');
}
