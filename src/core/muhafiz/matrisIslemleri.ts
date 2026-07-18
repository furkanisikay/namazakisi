import type {
  MuhafizMatrisi,
  MuhafizVakti,
  SeviyeAyari,
  SeviyeKademe,
  Siklik,
  UyariModu,
  VakitMuhafizAyari,
} from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from './matrisTipleri';
import { sesliAnonsGerekliMi } from './motorAdaptoru';
import { ANONS_SABLONLARI } from './anonsMetni';

const derinKopya = <T>(o: T): T => JSON.parse(JSON.stringify(o));

export function tumVakitlereUygula(matris: MuhafizMatrisi, kaynak: MuhafizVakti): MuhafizMatrisi {
  // Bos nesneyle basla: her vakit zaten kaynagin taze kopyasiyla dolduruluyor,
  // bu yuzden bastaki tam-matris klonu atil is olurdu (JSON round-trip x2).
  const sonuc = {} as MuhafizMatrisi;
  for (const v of MUHAFIZ_VAKITLERI) {
    sonuc[v] = derinKopya(matris[kaynak]);
  }
  return sonuc;
}

/**
 * Hazir yogunluk preset'inin TEK bir seviyesi.
 *
 * `bildirimSesi` ARTIK YOK — preset ACILIYETI (`acilKanal`) yazar, SESI kullanici
 * secer. Eskiden preset `bildirimSesi: 'alarm'` yazarak hem sesi hem onemi
 * belirliyordu; ses kullanicinin sectigi bir muzik olabildigi icin bu, preset'e
 * her dokunuslda kullanicinin secimini SILERDI. Ayirinca preset aciliyeti yazar,
 * ses secimi bozulmadan kalir.
 *
 * `acilKanal` ZORUNLUdur (opsiyonel degil): "yoksa mevcut korunur" denseydi yogun
 * preset'inin acil bayragi normal'e gecildiginde hucrede YAPISIR ve "dengeli"
 * yogunlukta sessizce acil kanala dusulurdu.
 */
export interface PresetSeviyeAyari {
  esikDk: number;
  siklik: Siklik;
  mod: UyariModu;
  /** Bu adim MAX onem + bypassDnd ile mi gonderilsin? */
  acilKanal: boolean;
}

export type PresetSeviyeleri = Record<SeviyeKademe, PresetSeviyeAyari>;

/** Preset'in herhangi bir seviyesi sesli anons (TTS) istiyor mu? */
export function presetSesliIceriyorMu(seviyeler: PresetSeviyeleri): boolean {
  return SEVIYE_KADEMELERI.some((kademe) => sesliAnonsGerekliMi(seviyeler[kademe].mod));
}

/**
 * Preset seviyesini TEK bir hucreye uygular.
 *
 * `sesliIzinVar === false` iken sesli/ikisi modlari 'bildirim'e DUSER: sesli anons
 * `USAGE_ALARM` ile sessiz modu ve Rahatsiz Etmeyin'i deler, bu yuzden kullaniciya
 * anlatilip onaylanmadan etkinlestirilmez. Preset yine uygulanir (gorsel iz kalir).
 *
 * Kullanicinin kendi yazdigi `anonsMetni` ASLA ezilmez; yalniz BOS kutu sablonla
 * doldurulur (SeviyeDetayModal.modSec ile ayni kural — metinsiz 'sesli' adim
 * sessiz kalirdi).
 *
 * Kullanicinin sectigi BILDIRIM SESI de (`bildirimSesi`/`sesAdi`) korunur: preset
 * zamanlama + mod + ACILIYET yazar, ses kullanicinindir.
 */
function seviyeyeUygula(
  mevcut: SeviyeAyari,
  preset: PresetSeviyeAyari,
  sesliIzinVar: boolean
): SeviyeAyari {
  const mod: UyariModu =
    !sesliIzinVar && sesliAnonsGerekliMi(preset.mod) ? 'bildirim' : preset.mod;
  return {
    ...mevcut,
    mod,
    esikDk: preset.esikDk,
    siklik: preset.siklik,
    acilKanal: preset.acilKanal,
    anonsMetni:
      sesliAnonsGerekliMi(mod) && !mevcut.anonsMetni ? ANONS_SABLONLARI[0] : mevcut.anonsMetni,
  };
}

/**
 * Hazir yogunlugu MEVCUT matrise uygular (tum vakitler, tum seviyeler).
 *
 * SOZLESME: preset esik + siklik + mod + ACILIYET yazar. Korunan kullanici verileri
 * `anonsMetni` ve BILDIRIM SESI secimidir (`bildirimSesi`/`sesAdi`) — sesi preset'in
 * yazmasi, kullanicinin sectigi muzigi her preset dokunusunda silerdi. Elle yapilan
 * zamanlama degisiklikleri zaten `ozelMatrisYedegi` ile saklanir → veri kaybi yok.
 */
export function presetUygula(
  matris: MuhafizMatrisi,
  seviyeler: PresetSeviyeleri,
  sesliIzinVar: boolean
): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    sonuc[v].seviyeler = sonuc[v].seviyeler.map((s, i) =>
      seviyeyeUygula(s, seviyeler[SEVIYE_KADEMELERI[i]], sesliIzinVar)
    );
  }
  return sonuc;
}

/**
 * Preset'ten SIFIRDAN matris uretir (mevcut matris yokken: ilk kurulum sihirbazi,
 * slice initialState).
 *
 * Sihirbaz yolu eskiden preset'i yalniz eski `esikler`/`sikliklar` alanlarina
 * yaziyordu; matris `eskidenMatriseGoc` ile turetildigi icin mod DAIMA 'bildirim'
 * oluyordu → sihirbazdan gecen kullanicida sesli preset'ler calismiyordu.
 */
export function presetMatrisiOlustur(
  seviyeler: PresetSeviyeleri,
  sesliIzinVar: boolean
): MuhafizMatrisi {
  const vakitAyari = (): VakitMuhafizAyari => ({
    seviyeler: SEVIYE_KADEMELERI.map((kademe) =>
      seviyeyeUygula(
        {
          kademe,
          mod: 'bildirim',
          esikDk: seviyeler[kademe].esikDk,
          siklik: 'birkez',
          bildirimSesi: VARSAYILAN_SES,
          acilKanal: false,
          anonsMetni: '',
        },
        seviyeler[kademe],
        sesliIzinVar
      )
    ),
  });
  const matris = {} as MuhafizMatrisi;
  for (const v of MUHAFIZ_VAKITLERI) matris[v] = vakitAyari();
  return matris;
}

const siklikDk = (s: Siklik): number => (s === 'birkez' ? -1 : s.herDk);

export function zamanlamaDegistiMi(a: MuhafizMatrisi, b: MuhafizMatrisi): boolean {
  // Yalnız esikDk + siklik karşılaştırılır (mod/ses/anons zamanlama ekseni değil).
  for (const v of MUHAFIZ_VAKITLERI) {
    const as = a[v].seviyeler, bs = b[v].seviyeler;
    for (let i = 0; i < as.length; i++) {
      if (as[i].esikDk !== bs[i].esikDk) return true;
      if (siklikDk(as[i].siklik) !== siklikDk(bs[i].siklik)) return true;
    }
  }
  return false;
}
