import type { Sozluk } from '../tr';

/**
 * Kannada konuşan Hint Müslümanlarının namaz sonrası ve selam için kullandığı kalıplar (çeviri
 * değil). Kabul duası "ಅಲ್ಲಾಹು ಸ್ವೀಕರಿಸಲಿ" (meal 2:127 "ನಮ್ಮಿಂದ ಇದನ್ನು ಸ್ವೀಕರಿಸು" kökü + HadeethEnc
 * kn'deki dilek kipi ‑ಅಲಿ, "ಅಲ್ಲಾಹು … ಸಂಪ್ರೀತನಾಗಲಿ"); Rab ಪರಿಪಾಲಕ (meal). Bayram, cuma ve Ramazan
 * selamı Hint Müslümanlarının yaygın "… ಮುಬಾರಕ್" kalıbıdır. Övgü ve "!" yok. Kandil selamı yalnız
 * ülke listesindeki gecelerde söylenir (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip
 * bütünlüğü içindir. Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'ಒಳಿತಾಗಲಿ.',
  kabulDualari: ['ಅಲ್ಲಾಹು ಸ್ವೀಕರಿಸಲಿ', 'ಸ್ವೀಕಾರವಾಗಲಿ', 'ಅಲ್ಲಾಹು ಸ್ವೀಕರಿಸಲಿ', 'ನಮ್ಮ ಪರಿಪಾಲಕನು ಸ್ವೀಕರಿಸಲಿ'],
  kabulDuasi: 'ಅಲ್ಲಾಹು ಸ್ವೀಕರಿಸಲಿ',
  ekSabah: 'ಶುಭೋದಯ',
  ekYatsi: 'ಶುಭ ರಾತ್ರಿ',
  tamGunAna: 'ಅಲ್ಲಾಹು ಸ್ವೀಕರಿಸಲಿ',
  tamGunAlt: 'ಇಂದು ನೀವು ಐದೂ ನಮಾಝ್‌ಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ.',
  kazaKabul: 'ನಿಮ್ಮ ಖಝಾ ದಾಖಲೆಯಿಂದ ಒಂದು {vakit} ಖಝಾ ಕಡಿಮೆ ಮಾಡಲಾಗಿದೆ. {dua}.',
  kandilGeceleri: {
    regaib: 'ರಗಾಇಬ್ ರಾತ್ರಿ ಮುಬಾರಕ್',
    mirac: 'ಶಬೆ ಮಿಅರಾಜ್ ಮುಬಾರಕ್',
    berat: 'ಶಬೆ ಬರಾಅತ್ ಮುಬಾರಕ್',
    mevlid: 'ಮೀಲಾದುನ್ನಬಿ ಮುಬಾರಕ್',
  },
  selamlar: {
    sahur: 'ಸಹರಿಯಲ್ಲಿ ಬರಕತ್ ಇರಲಿ',
    bayram: 'ಈದ್ ಮುಬಾರಕ್',
    iftar: 'ಇಫ್ತಾರ್‌ನಲ್ಲಿ ಬರಕತ್ ಇರಲಿ',
    kadir: 'ಲೈಲತುಲ್ ಖದ್ರ್ ಮುಬಾರಕ್',
    arefe: 'ಈದ್ ಮುನ್ನಾದಿನದ ಶುಭಾಶಯಗಳು',
    hicriYilbasi: 'ಹಿಜ್ರಿ ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು',
    cuma: 'ಜುಮಾ ಮುಬಾರಕ್',
    ramazan: 'ರಮದಾನ್ ಮುಬಾರಕ್',
    sabah: 'ಶುಭೋದಯ',
  },
};
