import type { Sozluk } from '../tr';

/**
 * Tamil Müslümanlarının dua kalıpları (çeviri değil): "அல்லாஹ் ஏற்றுக்கொள்வானாக" (kök
 * ஏற்றுக்கொள், meal 2:127; kalıp türetildi, DOĞRULANMADI), Arapça kökenli "கபூல் செய்வானாக"
 * ve "எங்கள் இறைவன்" (meal 2:127 "எங்கள் இறைவா"). Bayram "ஈத் முபாரக்", barakah "பரக்கத்".
 * Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir; buradakiler tip
 * bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'அல்லாஹ் பரக்கத் செய்வானாக.',
  kabulDualari: ['அல்லாஹ் ஏற்றுக்கொள்வானாக', 'அல்லாஹ் கபூல் செய்வானாக', 'அல்லாஹ் ஏற்றுக்கொள்வானாக', 'எங்கள் இறைவன் ஏற்றுக்கொள்வானாக'],
  kabulDuasi: 'அல்லாஹ் ஏற்றுக்கொள்வானாக',
  ekSabah: 'அருள் நிறைந்த காலை அமையட்டும்',
  ekYatsi: 'அருள் நிறைந்த இரவு அமையட்டும்',
  tamGunAna: 'அல்லாஹ் ஏற்றுக்கொள்வானாக',
  tamGunAlt: 'இன்று ஐவேளைத் தொழுகைகளையும் நிறைவு செய்தீர்கள்.',
  kazaKabul: 'உங்கள் பதிவேட்டிலிருந்து ஒரு {vakit} களா கழிக்கப்பட்டது. {dua}.',
  kandilGeceleri: {
    regaib: 'பரக்கத்தான ரகாயிப் இரவு',
    mirac: 'பரக்கத்தான இஸ்ரா மிஃராஜ் இரவு',
    berat: 'பரக்கத்தான பராஅத் இரவு',
    mevlid: 'பரக்கத்தான மவ்லித்',
  },
  selamlar: {
    sahur: 'பரக்கத்தான ஸஹர்',
    bayram: 'ஈத் முபாரக்',
    iftar: 'பரக்கத்தான இஃப்தார்',
    kadir: 'பரக்கத்தான லைலத்துல் கத்ர்',
    arefe: 'பரக்கத்தான பெருநாள் முன்தினம்',
    hicriYilbasi: 'பரக்கத்தான ஹிஜ்ரி புத்தாண்டு',
    cuma: 'ஜுமுஆ முபாரக்',
    ramazan: 'ரமழான் முபாரக்',
    sabah: 'அருள் நிறைந்த காலை அமையட்டும்',
  },
};
