/**
 * Bir vaktin TEK bir hatirlatma adimini (seviyesini) acip kapatma — saf mantik.
 *
 * NEDEN AYRI BIR KAVRAM: motor icin "kapali" zaten `mod === 'sessiz'`tir ve oyle
 * kalir (tek dogruluk kaynagi). Ama kullanici bir adimi kapatip sonra actiginda
 * KURDUGU seyi geri istiyor: 'ikisi' modu, sectigi ses, yazdigi anons metni.
 * `mod`'u dogrudan 'sessiz' yapmak eski modu yok ediyordu; bu yuzden kapatma
 * aninda mod `oncekiMod`'a alinir ve acilista geri konur.
 *
 * `oncekiMod` MOTORA ULASMAZ — `UyariPlani` onu tasimaz, bes tuketicinin hicbiri
 * okumaz. Yalnizca bir geri-alma hafizasidir.
 */
import type { SeviyeAyari, UyariModu } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { sesliAnonsGerekliMi } from './motorAdaptoru';
import { varsayilanAnonsMetni } from './anonsMetni';

/** Kapali olmayan modlar — `oncekiMod` yalniz bunlardan biri olabilir. */
type AcikMod = Exclude<UyariModu, 'sessiz'>;

/** Acilirken hatirlanan mod yoksa (veya bozuksa) dusulen guvenli mod. */
const YEDEK_MOD: AcikMod = 'bildirim';

/**
 * Adim hatirlatma yapiyor mu? (Motorla ayni kural: sessiz = pencere yok.)
 * Tip daraltir: dogruysa `mod` kesinlikle bir `AcikMod`'dur.
 */
export const seviyeAcikMi = (
  seviye: SeviyeAyari
): seviye is SeviyeAyari & { mod: AcikMod } => seviye.mod !== 'sessiz';

/**
 * Adimi kapatir; kapatma anindaki modu geri donus icin saklar.
 * Zaten kapaliysa AYNI referansi dondurur — gereksiz matris yazimi (ve dolayisiyla
 * disk yazimi + yeniden planlama) tetiklenmesin.
 */
export const seviyeyiKapat = (seviye: SeviyeAyari): SeviyeAyari => {
  if (!seviyeAcikMi(seviye)) return seviye;
  return { ...seviye, mod: 'sessiz', oncekiMod: seviye.mod };
};

/**
 * Adimi hatirlanan moduyla geri acar.
 *
 * Sesli bir mod geri gelirken BOS anons kutusu birakilmaz (SeviyeDetayModal.modSec
 * ve matrisIslemleri.seviyeyeUygula ile ayni sozlesme): metinsiz 'sesli' adim
 * sessiz kalir, kullanici actigi adimin calismadigini sanirdi. Kullanicinin kendi
 * yazdigi metin ASLA ezilmez.
 *
 * `yon` VAKTIN penceresinin yonudur (`VakitMuhafizAyari.yon`): giris yonunde
 * cikis dilli sablonla doldurmak, vakit YENI GIRMISKEN "son 42 dakika" dedirtir.
 */
export const seviyeyiAc = (
  seviye: SeviyeAyari,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): SeviyeAyari => {
  if (seviyeAcikMi(seviye)) return seviye;

  // Hatirlanan mod 'sessiz' ise (bozuk/eski kayit) oldugu gibi geri koymak
  // "actim ama yine sessiz" kilidi yaratirdi. Tip bunu yasaklar ama DISKTEN gelen
  // veri tipe uymak zorunda degil — bu yuzden genis tiple okunup dogrulanir.
  const hatirlanan = seviye.oncekiMod as UyariModu | undefined;
  const mod: AcikMod =
    !hatirlanan || hatirlanan === 'sessiz' ? YEDEK_MOD : (hatirlanan as AcikMod);

  const { oncekiMod: _unutulan, ...kalan } = seviye;
  return {
    ...kalan,
    mod,
    anonsMetni:
      sesliAnonsGerekliMi(mod) && !seviye.anonsMetni
        ? varsayilanAnonsMetni(yon)
        : seviye.anonsMetni,
  };
};
