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
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { sesliAnonsGerekliMi } from './motorAdaptoru';
import { anonsSablonlari, varsayilanAnonsMetni } from './anonsMetni';

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
 *
 * Doldurma YON-UYGUNdur: giris yonundeki bir vakte cikis dilli sablon yazmak
 * ("...vakti cikiyor, son {sure} dakika") vakit YENI GIRMISKEN okunurdu.
 */
function seviyeyeUygula(
  mevcut: SeviyeAyari,
  preset: PresetSeviyeAyari,
  sesliIzinVar: boolean,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): SeviyeAyari {
  const mod: UyariModu =
    !sesliIzinVar && sesliAnonsGerekliMi(preset.mod) ? 'bildirim' : preset.mod;
  return {
    ...mevcut,
    mod,
    esikDk: preset.esikDk,
    siklik: preset.siklik,
    acilKanal: preset.acilKanal,
    // Preset MOD yazdigi icin hucre kesin aciliyor → "kapatildiginda hatirlanan mod"
    // hafizasi (`oncekiMod`) anlamini yitirir. Birakilsaydi "`oncekiMod` var ⟺ hucre
    // kapali" invariantı kirilir, ileride sessiz adim iceren bir preset eklendiginde
    // bayat deger gercekten yanlis moda dondururdu.
    oncekiMod: undefined,
    anonsMetni:
      sesliAnonsGerekliMi(mod) && !mevcut.anonsMetni
        ? varsayilanAnonsMetni(yon)
        : mevcut.anonsMetni,
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
      seviyeyeUygula(s, seviyeler[SEVIYE_KADEMELERI[i]], sesliIzinVar, sonuc[v].yon)
    );
  }
  return sonuc;
}

/**
 * Preset'in YALNIZ ZAMANLAMASINI (esik + siklik) mevcut matrise uygular.
 *
 * NEDEN AYRI: bir kerelik preset gocu bunu kullanir. Gocun amaci ETKISIZ TEKRARI
 * kesmekti; kullanicinin uyari BICIMINI degistirmek degil. `presetUygula` mod +
 * aciliyeti de yazar — goc yolunda bu, "Yatsi'yi susturmus ama yogunlugu 'normal'
 * kalmis" kullanicinin secimini sessizce ezerdi (mod degisikligi yogunlugu 'ozel'
 * YAPMAZ — spec 4.1 — yani boyle kullanici goc kapisindan gecer ve geri donusu de
 * yoktur: goc `ozelMatrisYedegi` yazmaz).
 *
 * Bu yuzden korunan alanlar: `mod`, `acilKanal`, `bildirimSesi`/`sesAdi`, `anonsMetni`.
 */
export function presetZamanlamasiniUygula(
  matris: MuhafizMatrisi,
  seviyeler: PresetSeviyeleri
): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    sonuc[v].seviyeler = sonuc[v].seviyeler.map((s, i) => {
      const preset = seviyeler[SEVIYE_KADEMELERI[i]];
      return { ...s, esikDk: preset.esikDk, siklik: preset.siklik };
    });
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

/**
 * Bir vaktin YONUNU degistirir ve hucrelerdeki OTOMATIK DOLDURULMUS anons
 * metinlerini karsi yonun sablonuna cevirir.
 *
 * NEDEN GEREKLI (B11'in acik kalan kismi): doldurma anini yone bagladigimizda is
 * bitmiyor — hucrede zaten duran cikis dilli sablon ("...vakti cikiyor, son
 * {sure} dakika") yon girise cevrilince "son 42 dakika" diye SESLENDIRILIR.
 * "Kullanicinin metnini ezme" kurali burada ise yaramaz: otomatik doldurulmus
 * sablonu kullanicinin yazdigindan AYIRT EDEMEZ.
 *
 * AYIRT EDICI OLCUT = BIREBIR ESLESME. Metin havuzdaki bir sablonla tam olarak
 * ayniysa (kirpma/normalize YOK — sonuna bosluk eklenmisse bile artik kullanici
 * metnidir) karsi yonun ayni INDEKSTEKI sablonuyla degistirilir; degilse
 * DOKUNULMAZ. Boylece elle yazilan metin asla kaybolmaz; bedeli, cevrilemeyen
 * metin icin ekranin ipucu gostermesidir (Faz 3 / A6).
 *
 * `{yon}` yer tutucusuyla yazilmis metinler zaten iki yonde de dogru okunur ve
 * havuzda olmadiklari icin buradan gecerken degismezler.
 *
 * Degisecek bir sey yoksa AYNI REFERANSI dondurur (gereksiz disk yazimi +
 * yeniden planlama olmasin — `seviyeyiAc`/`seviyeyiKapat` ile ayni sozlesme).
 */
export function yonDegisimindeMetniCevir(
  vakitAyari: VakitMuhafizAyari,
  hedefYon: PencereYonu
): VakitMuhafizAyari {
  const mevcutYon = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
  const kaynakHavuz = anonsSablonlari(mevcutYon);
  const hedefHavuz = anonsSablonlari(hedefYon);

  let degisti = mevcutYon !== hedefYon;
  const seviyeler = vakitAyari.seviyeler.map((s) => {
    const i = s.anonsMetni ? kaynakHavuz.indexOf(s.anonsMetni) : -1;
    if (i < 0 || hedefHavuz[i] === undefined || hedefHavuz[i] === s.anonsMetni) return s;
    degisti = true;
    return { ...s, anonsMetni: hedefHavuz[i] };
  });

  if (!degisti) return vakitAyari;
  return { ...vakitAyari, yon: hedefYon, seviyeler };
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
