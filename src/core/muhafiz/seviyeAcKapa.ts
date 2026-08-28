/**
 * Bir vaktin TEK bir hatirlatma adimini (seviyesini) acip kapatma — saf mantik.
 *
 * NEDEN AYRI BIR KAVRAM: motor icin "kapali" zaten "hicbir kanali acik degil"dir
 * ve oyle kalir (tek dogruluk kaynagi `kanallar`). Ama kullanici bir adimi kapatip
 * sonra actiginda KURDUGU seyi geri istiyor: acik kanallarini, sectigi sesi,
 * yazdigi anons metnini. `kanallar`i dogrudan bosaltmak kanal secimini yok
 * ediyordu; bu yuzden kapatma aninda kume `oncekiKanallar`a alinir ve acilista
 * geri konur.
 *
 * `oncekiKanallar` MOTORA ULASMAZ — `UyariPlani` onu tasimaz, bes tuketicinin
 * hicbiri okumaz. Yalnizca bir geri-alma hafizasidir.
 */
import type { SeviyeAyari, UyariKanallari } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { KAPALI_KANALLAR, VARSAYILAN_ACIK_KANALLAR, hicKanalAcikMi } from './kanalKumesi';
import { sesliAnonsGerekliMi } from './motorAdaptoru';
import { varsayilanAnonsMetni } from './anonsMetni';

/**
 * Adim hatirlatma yapiyor mu? (Motorla ayni kural: hicbir kanal acik degilse hayir.)
 */
export const seviyeAcikMi = (seviye: SeviyeAyari): boolean => !hicKanalAcikMi(seviye.kanallar);

/**
 * Adimi kapatir; kapatma anindaki kanal kumesini geri donus icin saklar.
 * Zaten kapaliysa AYNI referansi dondurur — gereksiz matris yazimi (ve dolayisiyla
 * disk yazimi + yeniden planlama) tetiklenmesin.
 */
export const seviyeyiKapat = (seviye: SeviyeAyari): SeviyeAyari => {
  if (!seviyeAcikMi(seviye)) return seviye;
  return { ...seviye, kanallar: KAPALI_KANALLAR, oncekiKanallar: seviye.kanallar };
};

/**
 * Adimi hatirlanan kanallariyla geri acar.
 *
 * Sesli bir kanal geri gelirken BOS anons kutusu birakilmaz (SeviyeDetayModal ve
 * matrisIslemleri.seviyeyeUygula ile ayni sozlesme): metinsiz sesli adim sessiz
 * kalir, kullanici actigi adimin calismadigini sanirdi. Kullanicinin kendi yazdigi
 * metin ASLA ezilmez.
 *
 * `yon` VAKTIN penceresinin yonudur (`VakitMuhafizAyari.yon`): giris yonunde
 * cikis dilli sablonla doldurmak, vakit YENI GIRMISKEN "son 42 dakika" dedirtir.
 */
export const seviyeyiAc = (
  seviye: SeviyeAyari,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): SeviyeAyari => {
  if (seviyeAcikMi(seviye)) return seviye;

  // Hatirlanan kume de BOSSA (bozuk/eski kayit) oldugu gibi geri koymak "actim
  // ama yine kapali" kilidi yaratirdi → guvenli yedege dusulur.
  const hatirlanan = seviye.oncekiKanallar;
  const kanallar: UyariKanallari = hicKanalAcikMi(hatirlanan)
    ? VARSAYILAN_ACIK_KANALLAR
    : (hatirlanan as UyariKanallari);

  const { oncekiKanallar: _unutulan, ...kalan } = seviye;
  return {
    ...kalan,
    kanallar,
    anonsMetni:
      sesliAnonsGerekliMi(kanallar) && !seviye.anonsMetni
        ? varsayilanAnonsMetni(yon)
        : seviye.anonsMetni,
  };
};
