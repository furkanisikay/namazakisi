/**
 * Vakit sayacı bildiriminin başlangıç eşiğini (dakika) hesaplar.
 *
 * Kullanıcı, vakit sayacının hangi muhafız seviyesinde başlayacağını seçer
 * (`sayacBaslangicSeviyesi`, 1-4). Bu yardımcı o seviyeyi muhafız eşiklerinden
 * (dakika) okur. Seviye 1 = en erken başlangıç (varsayılan).
 *
 * TEK KAYNAK: App.tsx, AnaSayfa.tsx ve BildirimAyarlariSayfasi aynı eşlemeyi
 * kullanır. (Önceden App/AnaSayfa `esikler.seviye1`'e sabitti → kullanıcının seçtiği
 * başlangıç seviyesi yok sayılıyordu; #90 review bulgusu.)
 */
export interface MuhafizEsikKaynagi {
  esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}

export const sayacBaslangicEsikDkHesapla = (
  seviye: number | undefined,
  muhafiz: MuhafizEsikKaynagi
): number => {
  switch (seviye) {
    case 2:
      return muhafiz.esikler.seviye2;
    case 3:
      return muhafiz.esikler.seviye3;
    case 4:
      return muhafiz.esikler.seviye4;
    default:
      return muhafiz.esikler.seviye1;
  }
};
