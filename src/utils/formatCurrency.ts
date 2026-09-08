/**
 * Format angka ke format mata uang Rupiah Indonesia
 * Contoh: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string | undefined | null): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  if (isNaN(numericAmount)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Format angka ribuan biasa tanpa simbol Rp
 */
export function formatNumber(amount: number | string | undefined | null): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  if (isNaN(numericAmount)) return '0';
  
  return new Intl.NumberFormat('id-ID').format(numericAmount);
}

/**
 * Format tanggal ke bahasa Indonesia
 */
export function formatTanggal(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}
