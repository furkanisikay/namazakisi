/**
 * Tarih islemleri icin yardimci fonksiyonlar
 */

import { bicim, metin } from '../dil/aktifDil';

// Gün/ay adları kullanıcıya GÖRÜNÜR (gök paneli başlığı, istatistik ay başlığı, ekran
// okuyucu etiketi) → etkin dilin sözlüğünden (`tarih`) gelir.

/**
 * Tarihi ISO formatina donusturur (yyyy-MM-dd)
 */
export const tarihiISOFormatinaCevir = (tarih: Date): string => {
  const yil = tarih.getFullYear();
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const gun = String(tarih.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
};

/**
 * ISO formatindaki tarihi Date nesnesine donusturur
 */
export const ISOTarihiDateNesnesiNeCevir = (isoTarih: string): Date => {
  const [yil, ay, gun] = isoTarih.split('-').map(Number);
  return new Date(yil, ay - 1, gun);
};

/**
 * Bugunun tarihini ISO formatinda dondurur
 */
export const bugunuAl = (): string => {
  return tarihiISOFormatinaCevir(new Date());
};

/**
 * Dunun tarihini ISO formatinda dondurur (yyyy-MM-dd)
 */
export const dunuAl = (): string => {
  return gunEkle(bugunuAl(), -1);
};

/**
 * Tarihe gun ekler/cikarir
 */
export const gunEkle = (isoTarih: string, gunSayisi: number): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  tarih.setDate(tarih.getDate() + gunSayisi);
  return tarihiISOFormatinaCevir(tarih);
};

/**
 * Gun adini dondurur
 */
export const gunAdiniAl = (isoTarih: string): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  return metin().tarih.gunler[tarih.getDay()];
};

/**
 * Standart gun kisaltmasini dondurur (Pzt, Sal, Çar…). Tam adin ilk uc harfi
 * KULLANILAMAZ: Pazar/Pazartesi ikisi de "Paz" olur (haftalik grafikte gorundu).
 */

export const gunKisaAdiniAl = (isoTarih: string): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  return metin().tarih.gunlerKisa[tarih.getDay()];
};

/**
 * Ay adını TEK BAŞINA kullanım için döndürür ("Ekim 2026" başlığı); tarih içinde `aylar` kullanılır.
 */
export const ayAdiniAl = (ay: number): string => {
  return metin().tarih.aylarYalin[ay];
};

/**
 * Tarihi gorunum formatina donusturur (dd MMMM yyyy)
 */
export const tarihiGorunumFormatinaCevir = (isoTarih: string): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  return bicim(metin().tarih.uzun, {
    gun: tarih.getDate(),
    ay: metin().tarih.aylar[tarih.getMonth()],
    yil: tarih.getFullYear(),
  });
};

/**
 * Iki tarihin ayni gun olup olmadigini kontrol eder
 */
export const ayniGunMu = (tarih1: string, tarih2: string): boolean => {
  return tarih1 === tarih2;
};

/**
 * Tarihin bugunden once olup olmadigini kontrol eder
 */
export const gecmisTarihMi = (isoTarih: string): boolean => {
  return isoTarih < bugunuAl();
};

/**
 * Tarihin bugun olup olmadigini kontrol eder
 */
export const bugunMu = (isoTarih: string): boolean => {
  return isoTarih === bugunuAl();
};

/**
 * Haftanin baslangic tarihini dondurur (Pazartesi)
 */
export const haftaninBaslangiciniAl = (isoTarih: string): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  const gun = tarih.getDay();
  const fark = gun === 0 ? -6 : 1 - gun; // Pazartesi'ye gore ayarla
  tarih.setDate(tarih.getDate() + fark);
  return tarihiISOFormatinaCevir(tarih);
};

/**
 * Ayin ilk gununu dondurur
 */
export const ayinIlkGunuAl = (isoTarih: string): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  return tarihiISOFormatinaCevir(new Date(tarih.getFullYear(), tarih.getMonth(), 1));
};

/**
 * Ayin son gununu dondurur
 */
export const ayinSonGunuAl = (isoTarih: string): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  return tarihiISOFormatinaCevir(new Date(tarih.getFullYear(), tarih.getMonth() + 1, 0));
};

/**
 * Belirli bir tarih araligindaki tum tarihleri dondurur
 */
export const tarihAraliginiAl = (baslangic: string, bitis: string): string[] => {
  const tarihler: string[] = [];
  let mevcutTarih = baslangic;
  
  while (mevcutTarih <= bitis) {
    tarihler.push(mevcutTarih);
    mevcutTarih = gunEkle(mevcutTarih, 1);
  }
  
  return tarihler;
};

/**
 * Son N gunu dondurur
 */
export const sonNGunuAl = (gunSayisi: number): string[] => {
  const bugun = bugunuAl();
  const tarihler: string[] = [];
  
  for (let i = gunSayisi - 1; i >= 0; i--) {
    tarihler.push(gunEkle(bugun, -i));
  }
  
  return tarihler;
};

