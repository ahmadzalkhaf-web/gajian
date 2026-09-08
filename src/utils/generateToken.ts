/**
 * Generate random token unik untuk akses slip gaji karyawan
 * Format contoh: SLIP-X8K29M
 */
export function generateSlipToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SLIP-${result}`;
}

/**
 * Generate Employee ID otomatis dengan format EMP001, EMP002, dst.
 */
export function generateNextEmployeeId(existingIds: string[]): string {
  let maxId = 0;
  existingIds.forEach((id) => {
    const match = id.match(/EMP(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxId) maxId = num;
    }
  });
  const nextNum = maxId + 1;
  return `EMP${nextNum.toString().padStart(3, '0')}`;
}

/**
 * Generate link slip gaji
 */
export function generateSlipLink(token: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://gajiku.app';
  return `${base}?slip=${encodeURIComponent(token)}`;
}
