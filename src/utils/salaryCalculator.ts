import { PayrollCalculationInput, PayrollCalculationResult } from '../types';

/**
 * Logika perhitungan gaji sesuai rumus Google Spreadsheet:
 * =IF(A5="","",IF(C5="Harian",D5*E5+(F5*E5)+G5+H5+I5+J5+K5-(L5*5)-M5,IF(C5="Borongan",E5+F5+G5,""))))
 * 
 * JIKA Tipe Gaji = Harian:
 * TOTAL = (Hadir × Gaji Pokok) + (Lembur × Gaji Pokok) + Bonus Koor 1 + Bonus Koor 2 + Bonus 1 + Bonus 2 + Bonus 3 - (Telat × 5) - Gaji Diambil Dalam 1 Minggu
 * 
 * JIKA Tipe Gaji = Borongan:
 * TOTAL = Gaji Pokok + Lembur + Bonus Koor 1
 */
export function calculateSalary(data: PayrollCalculationInput): PayrollCalculationResult {
  const hadir = Number(data.hadir) || 0;
  const gajiPokok = Number(data.gajiPokok) || 0;
  const lembur = Number(data.lembur) || 0;
  const bonusKoor1 = Number(data.bonusKoor1) || 0;
  const bonusKoor2 = Number(data.bonusKoor2) || 0;
  const bonus1 = Number(data.bonus1) || 0;
  const bonus2 = Number(data.bonus2) || 0;
  const bonus3 = Number(data.bonus3) || 0;
  const telat = Number(data.telat) || 0;
  const gajiDiambil = Number(data.gajiDiambil) || 0;

  if (data.tipeGaji === 'Harian') {
    const gajiUtama = hadir * gajiPokok;
    const lemburNominal = lembur * gajiPokok;
    const totalBonus = bonusKoor1 + bonusKoor2 + bonus1 + bonus2 + bonus3;
    const potonganTelat = telat * 5;
    const totalPotongan = potonganTelat + gajiDiambil;

    const total = gajiUtama + lemburNominal + totalBonus - totalPotongan;

    return {
      gajiUtama,
      lemburNominal,
      totalBonus,
      totalPotongan,
      total: Math.max(0, total),
      breakdown: {
        potonganTelat,
        potonganGajiDiambil: gajiDiambil,
      },
    };
  } else {
    // Borongan: Gaji Pokok + Lembur + Bonus Koor 1
    const gajiUtama = gajiPokok;
    const lemburNominal = lembur;
    const totalBonus = bonusKoor1;
    const totalPotongan = 0;
    const total = gajiUtama + lemburNominal + totalBonus;

    return {
      gajiUtama,
      lemburNominal,
      totalBonus,
      totalPotongan,
      total: Math.max(0, total),
      breakdown: {
        potonganTelat: 0,
        potonganGajiDiambil: 0,
      },
    };
  }
}
