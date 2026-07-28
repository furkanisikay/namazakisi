/**
 * Konum ayarlarından kullanıcıya gösterilecek konum metnini üretir (saf fonksiyon).
 * KonumAyarlari, MuhafizAyarlari ve Ayarlar ekranları için tek kaynak.
 *
 * Girdi tipi burada yerelleştirilmiştir — `src/core/` store'a bağımlı olamaz
 * (AGENTS.md); yapısal uyum yeterlidir, store'daki `KonumAyarlari` tipi
 * import EDİLMEZ. Bu dosya `src/presentation/hooks/useKonumMetni.ts`'den
 * TAŞINMIŞTIR — davranış birebir korunmuştur, o dosya artık bunu yeniden
 * dışa aktarır.
 */
export interface KonumMetniGirdisi {
  /** Konum modu: oto (GPS) veya manuel (şehir seçimi) */
  konumModu: 'oto' | 'manuel';
  /** GPS konum için adres bilgisi */
  gpsAdres: { ilce: string; il: string } | null;
  /** Seçili ilçe adı (manuel mod) */
  seciliIlceAdi: string;
  /** Seçili il adı (manuel mod) */
  seciliIlAdi: string;
}

export function konumMetniHesapla(konum: KonumMetniGirdisi): string {
  if (konum.konumModu === 'oto') {
    if (konum.gpsAdres) {
      const { ilce, il } = konum.gpsAdres;
      if (ilce && il) return `${ilce}, ${il}`;
      return ilce || il || 'GPS konumu alındı';
    }
    return 'Konum takip ediliyor';
  }
  if (konum.seciliIlceAdi && konum.seciliIlAdi) {
    return `${konum.seciliIlceAdi}, ${konum.seciliIlAdi}`;
  }
  return konum.seciliIlAdi || 'Konum seçilmedi';
}
