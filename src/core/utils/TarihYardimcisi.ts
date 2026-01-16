/**
 * Tarih islemleri icin yardimci fonksiyonlar
 */

const GUN_ISIMLERI = ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'];
const AY_ISIMLERI = [
  'Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran',
  'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'
];

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
  return GUN_ISIMLERI[tarih.getDay()];
};

/**
 * Ay adini dondurur
 */
export const ayAdiniAl = (ay: number): string => {
  return AY_ISIMLERI[ay];
};

/**
 * Tarihi gorunum formatina donusturur (dd MMMM yyyy)
 */
export const tarihiGorunumFormatinaCevir = (isoTarih: string): string => {
  const tarih = ISOTarihiDateNesnesiNeCevir(isoTarih);
  const gun = tarih.getDate();
  const ay = AY_ISIMLERI[tarih.getMonth()];
  const yil = tarih.getFullYear();
  return `${gun} ${ay} ${yil}`;
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

