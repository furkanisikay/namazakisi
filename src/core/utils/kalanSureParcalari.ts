/**
 * Geri sayımın GÖRÜNEN biçimi — birimli parçalar (saat, TV ve sade görünümle aynı dil).
 *
 * Ana ekran sayacı "01:09:09" yazıyordu: duvar saatinin yanında saat gibi okunur, kaç
 * saat/dakika olduğu tek bakışta anlaşılmaz. Kurallar (Wear `AnaEkranKarari.sayac` ve
 * TV `Bicim.kalanParcalari` ikizi):
 *  - bir saat ve üstü: "1 sa 9 dk" (saniye yok — saatlerce saniye saymak gürültü)
 *  - bir saatin altı:  "9 dk 05 sn" (saniye iki haneli → satır oynamaz)
 *  - bir dakikanın altı: "42 sn"
 * SAF: girdi AnaSayfa'nın ürettiği "SS:DD:ss" dizesidir; bozuksa olduğu gibi tek parça döner.
 */
export interface SureParcasi {
  sayi: string;
  birim: string;
}

export function kalanSureParcalari(ssddss: string): SureParcasi[] {
  const eslesme = /^(\d+):(\d{2}):(\d{2})$/.exec(ssddss.trim());
  if (!eslesme) return [{ sayi: ssddss, birim: '' }];
  const sa = Number(eslesme[1]);
  const dk = Number(eslesme[2]);
  const sn = eslesme[3];
  if (sa > 0) return [{ sayi: String(sa), birim: 'sa' }, { sayi: String(dk), birim: 'dk' }];
  if (dk > 0) return [{ sayi: String(dk), birim: 'dk' }, { sayi: sn, birim: 'sn' }];
  return [{ sayi: String(Number(sn)), birim: 'sn' }];
}

/** Ekran okuyucu metni: "1 saat 9 dakika", "9 dakika 5 saniye", "42 saniye". */
export function kalanSureSesli(ssddss: string): string {
  const adlar: Record<string, string> = { sa: 'saat', dk: 'dakika', sn: 'saniye' };
  return kalanSureParcalari(ssddss)
    .map((p) => (adlar[p.birim] ? `${Number(p.sayi)} ${adlar[p.birim]}` : p.sayi))
    .join(' ');
}
