import type { EskiUyariModu, MuhafizMatrisi, SeviyeAyari } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from './matrisTipleri';
import { modKanallaraCevir } from './kanalKumesi';
import { esikSiralamasiGecerliMi } from './aktifSeviye';
import { girisZamanlamasiniSec } from './girisZamanlamasi';

/** Eski semada ACILIYETI tasiyan ses id'si (bkz. `eskiAlarmSesiniGoc`). */
export const ESKI_ALARM_SESI = 'alarm';

export interface EskiMuhafizAyari {
  esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
  sikliklar: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}

export function eskidenMatriseGoc(eski: EskiMuhafizAyari): MuhafizMatrisi {
  const esikDizi = [eski.esikler.seviye1, eski.esikler.seviye2, eski.esikler.seviye3, eski.esikler.seviye4];
  const siklikDizi = [eski.sikliklar.seviye1, eski.sikliklar.seviye2, eski.sikliklar.seviye3, eski.sikliklar.seviye4];
  const vakitAyari = () => ({
    seviyeler: SEVIYE_KADEMELERI.map((kademe, i): SeviyeAyari => ({
      kademe,
      // Faz 2: eski global ayarda kanal kavrami YOKTU; tarihsel karsiligi
      // "yalniz bildirim"dir (sesli anons her zaman opt-in oldu).
      kanallar: { bildirim: true },
      esikDk: esikDizi[i],
      siklik: { herDk: siklikDizi[i] },
      bildirimSesi: VARSAYILAN_SES,
      anonsMetni: '',
    })),
  });
  const matris = {} as MuhafizMatrisi;
  for (const v of MUHAFIZ_VAKITLERI) matris[v] = vakitAyari();
  return matris;
}

/**
 * ESKI 'alarm' SES ID'SINI ACILIYET ALANINA TASIR (bir kerelik, idempotent).
 *
 * NEDEN: eski semada aciliyet SES ID'SIYLE tasiniyordu (`bildirimSesi: 'alarm'`
 * = MAX onem + bypassDnd). Ses ile onem ayrildiktan sonra bu deger diskte
 * OKSUZ kaldi: motor onu hala aciliyet sinyali sayiyordu ama UI'da izi yoktu
 * (`sesKimliginiNormalize('alarm')` → "Uygulama sesi"). Kullanici yeni bir ses
 * sectigi an aciliyet SESSIZCE kayboluyor, geri getirme yolu da bulunmuyordu.
 *
 * Goc, anlami GORUNUR ve DEGISTIRILEBILIR bir alana taşır:
 *   `bildirimSesi: 'alarm'` → `bildirimSesi: 'varsayilan'` + `acilKanal: true`
 *
 * `acilKanal` ZATEN yazilmissa dokunulmaz — kullanicinin acik tercihi eski
 * cikarimdan onceliklidir (uc durumlu `acilKanal`, bkz. `muhafizAcilKanalMi`).
 *
 * DEGISIKLIK YOKSA AYNI REFERANS doner: `muhafizMatrisiniCoz` kimligi korur ve
 * gereksiz kopya/diske-yazma tetiklenmez.
 */
export function eskiAlarmSesiniGoc(matris: MuhafizMatrisi): MuhafizMatrisi {
  let degisti = false;
  const sonuc = {} as MuhafizMatrisi;

  for (const vakit of MUHAFIZ_VAKITLERI) {
    const vakitAyari = matris[vakit];
    if (!vakitAyari?.seviyeler) {
      sonuc[vakit] = vakitAyari;
      continue;
    }

    let vakitDegisti = false;
    const seviyeler = vakitAyari.seviyeler.map((seviye) => {
      if (seviye?.bildirimSesi !== ESKI_ALARM_SESI) return seviye;
      vakitDegisti = true;
      return {
        ...seviye,
        bildirimSesi: VARSAYILAN_SES,
        sesAdi: undefined,
        acilKanal: seviye.acilKanal ?? true,
      };
    });

    if (vakitDegisti) degisti = true;
    sonuc[vakit] = vakitDegisti ? { ...vakitAyari, seviyeler } : vakitAyari;
  }

  return degisti ? sonuc : matris;
}

/**
 * GIRIS YONLU VAKITLERIN ESIKLERINI YONE UYGUN HALE GETIRIR (idempotent).
 *
 * SAHADAKI BOZUK KAYIT: yon degistirme yolu eskiden yalniz anons metnini cevirip
 * `yon` alanini yaziyordu, `esikDk`'ye HIC dokunmuyordu → giris yonunu secmis her
 * kullanicinin esikleri CIKIS sirasinda (45/25/10/3, AZALAN) kaldi. Giris yonunde
 * kapsama `olcuDk >= esikDk` ve EN BUYUK esik kazandigi icin eskalasyon tersine
 * doner: vakit girer girmez en sert ton, sure gectikce naziklesme, en buyuk
 * esikten sonra TAM SESSIZLIK (yatsida 8 saat). Kullanici elle de duzeltemez:
 * `esikSinirlariniHesapla` komsu kisitini girişte ters cevirir ve azalan degerlerle
 * min > max cikarak stepper'i tek degere kilitler.
 *
 * KOSUL = `esikSiralamasiGecerliMi` (TEK siralama kapisi). Duzeltme sonrasi kosul
 * false doner → goc bir daha calismaz; kesin ARTAN kurmus BILINCLI kullaniciya hic
 * dokunmaz. Kapali adimlar da sayilir (yuklem kanallara bakmaz) — UI kapali adimi
 * yine de esik sinirlarinda kilitlemeye devam ettigi icin tutarli.
 *
 * YALNIZ ZAMANLAMA TASIR (`esikDk` + `siklik`): kanal, aciliyet, ses ve anons metni
 * kullanicinindir (`presetZamanlamasiniUygula` goc sozlesmesinin ikizi).
 *
 * BILINEN KENAR: esikleri elle KISMEN duzeltmis kullanici (or. 45/25/10/200) tumden
 * tabloya ceker — dort hucre tek bir zamanlama tablosu oldugu icin kismi kurtarma
 * anlamsiz olurdu.
 *
 * DEGISIKLIK YOKSA AYNI REFERANS doner (`eskiAlarmSesiniGoc` ile ayni sozlesme).
 *
 * @param yogunluk Hazir yogunluk; 'ozel'/bilinmeyen ise giris tablosu varsayilana duser.
 */
export function yonEsiklerineGoc(matris: MuhafizMatrisi, yogunluk?: unknown): MuhafizMatrisi {
  let degisti = false;
  const sonuc = {} as MuhafizMatrisi;

  for (const vakit of MUHAFIZ_VAKITLERI) {
    const vakitAyari = matris[vakit];
    sonuc[vakit] = vakitAyari;

    if (!vakitAyari?.seviyeler || vakitAyari.seviyeler.length !== SEVIYE_KADEMELERI.length) continue;
    if (vakitAyari.yon !== 'girisindenItibaren') continue;
    if (esikSiralamasiGecerliMi(vakitAyari.seviyeler, 'girisindenItibaren')) continue;

    const tablo = girisZamanlamasiniSec(vakit, yogunluk);
    degisti = true;
    sonuc[vakit] = {
      ...vakitAyari,
      seviyeler: vakitAyari.seviyeler.map((seviye, i) => {
        const hedef = tablo[SEVIYE_KADEMELERI[i]];
        return { ...seviye, esikDk: hedef.esikDk, siklik: hedef.siklik };
      }),
    };
  }

  return degisti ? sonuc : matris;
}

/** Faz 2 oncesi disk semasindaki hucre: `mod` + `oncekiMod` tasir. */
type EskiSemaSeviyesi = SeviyeAyari & {
  mod?: EskiUyariModu;
  oncekiMod?: EskiUyariModu;
};

/**
 * `mod: UyariModu` → `kanallar: UyariKanallari` GOCU (bir kerelik, idempotent).
 *
 * `oncekiMod` DA CEVRILIR — atlanirsa yasanmis bir bug geri gelir: kapali adim
 * diskte `mod:'sessiz' + oncekiMod:'ikisi'` tasir; yalniz `mod` cevrilseydi
 * `oncekiMod` OKSUZ kalir, `seviyeyiAc` `{bildirim:true}` yedegine duser ve
 * "bildirim + sesli + ozel ses + anons metni" ile kurup kapatmis kullanici adimi
 * geri actiginda kurdugunu KAYBEDERDI (`seviyeAcKapa`'nin varlik sebebi olan bug).
 *
 * Eskiyen alanlar (`mod`/`oncekiMod`) kayittan SILINIR — iki dogruluk kaynagi
 * kalmasin. `kanallar` zaten varsa hucreye DOKUNULMAZ (goc tekrar calisamaz).
 *
 * DEGISIKLIK YOKSA AYNI REFERANS doner (`eskiAlarmSesiniGoc` ile ayni sozlesme):
 * `muhafizMatrisiniCoz` kimligi korur, gereksiz diske yazma tetiklenmez.
 */
export function modlariKanallaraGoc(matris: MuhafizMatrisi): MuhafizMatrisi {
  let degisti = false;
  const sonuc = {} as MuhafizMatrisi;

  for (const vakit of MUHAFIZ_VAKITLERI) {
    const vakitAyari = matris[vakit];
    if (!vakitAyari?.seviyeler) {
      sonuc[vakit] = vakitAyari;
      continue;
    }

    let vakitDegisti = false;
    const seviyeler = vakitAyari.seviyeler.map((ham) => {
      const seviye = ham as EskiSemaSeviyesi;
      if (!seviye || seviye.kanallar) return ham;
      vakitDegisti = true;

      const { mod, oncekiMod, ...kalan } = seviye;
      const yeni: SeviyeAyari = { ...kalan, kanallar: modKanallaraCevir(mod) };
      if (oncekiMod) yeni.oncekiKanallar = modKanallaraCevir(oncekiMod);
      return yeni;
    });

    if (vakitDegisti) degisti = true;
    sonuc[vakit] = vakitDegisti ? { ...vakitAyari, seviyeler } : vakitAyari;
  }

  return degisti ? sonuc : matris;
}
