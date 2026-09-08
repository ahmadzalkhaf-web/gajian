/**
 * Konfigurasi Endpoint Google Apps Script Web App API
 * URL ini menghubungkan aplikasi langsung dengan Google Spreadsheet sebagai database utama.
 */

const STORAGE_KEY = 'gajiku_gas_api_url';

export const DEFAULT_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL) || '';

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  }
  return DEFAULT_API_URL;
}

export function setApiUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
