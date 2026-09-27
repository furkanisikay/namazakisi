import type {
  MuhafizMatrisi,
  MuhafizVakti,
  SeviyeAyari,
  SeviyeKademe,
  Siklik,
  UyariKanallari,
  VakitMuhafizAyari,
  YonZamanlamaYedegi,
} from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from './matrisTipleri';
import { VARSAYILAN_ACIK_KANALLAR, kanalAc, kanalKapat } from './kanalKumesi';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { sesliAnonsGerekliMi } from './motorAdaptoru';
import { anonsSablonlari, varsayilanAnonsMetni } from './anonsMetni';
import type { ZamanlamaAyari, ZamanlamaSeviyeleri } from './girisZamanlamasi';
import { girisZamanlamasiniSec } from './girisZamanlamasi';
import { esikSiralamasiGecerliMi } from './aktifSeviye';

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
  /** Bu adim hangi kanallardan uyarir? (Faz 2'de `mod: UyariModu` yerini aldi.) */
  kanallar: UyariKanallari;
  /** Bu adim MAX onem + bypassDnd ile mi gonderilsin? */
  acilKanal: boolean;
}

export type PresetSeviyeleri = Record<SeviyeKademe, PresetSeviyeAyari>;

/** Preset'in herhangi bir seviyesi sesli anons (TTS) istiyor mu? */
export function presetSesliIceriyorMu(seviyeler: PresetSeviyeleri): boolean {
  return SEVIYE_KADEMELERI.some((kademe) => sesliAnonsGerekliMi(seviyeler[kademe].kanallar));
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
 * zamanlama + KANALLAR + ACILIYET yazar, ses kullanicinindir.
 *
 * Doldurma YON-UYGUNdur: giris yonundeki bir vakte cikis dilli sablon yazmak
 * ("...vakti cikiyor, son {sure} dakika") vakit YENI GIRMISKEN okunurdu.
 */
function seviyeyeUygula(
  mevcut: SeviyeAyari,
  preset: PresetSeviyeAyari,
  sesliIzinVar: boolean,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
  zamanlama?: ZamanlamaAyari
): SeviyeAyari {
  // Sesli izni yoksa SESLI kanali kapanir ama adim SUSTURULMAZ: bildirim kanali
  // acilir. (Eski `mod` semasinda bu "'sesli'/'ikisi' → 'bildirim'" idi; yalniz
  // sesli kanali kapatsaydik sadece-sesli bir preset hucresi tumden kapanirdi.)
  const kanallar: UyariKanallari =
    !sesliIzinVar && sesliAnonsGerekliMi(preset.kanallar)
      ? kanalAc(kanalKapat(preset.kanallar, 'sesli'), 'bildirim')
      : preset.kanallar;
  return {
    ...mevcut,
    kanallar,
    // Zamanlama YONE gore gelir: giris yonlu bir vakte cikis tablosunu
    // (45/25/10/3) yazmak eskalasyonu TERSINE cevirir — yon degisimi
    // duzeltilse bile preset karti hatayi geri getirirdi.
    esikDk: zamanlama ? zamanlama.esikDk : preset.esikDk,
    siklik: zamanlama ? zamanlama.siklik : preset.siklik,
    acilKanal: preset.acilKanal,
    // Preset KANALLARI yazdigi icin hucre kesin aciliyor → "kapatildiginda
    // hatirlanan kume" hafizasi (`oncekiKanallar`) anlamini yitirir. Birakilsaydi
    // "`oncekiKanallar` var ⟺ hucre kapali" invariantı kirilir, ileride kapali adim
    // iceren bir preset eklendiginde bayat deger gercekten yanlis kanallari acardi.
    oncekiKanallar: undefined,
    anonsMetni:
      sesliAnonsGerekliMi(kanallar) && !mevcut.anonsMetni
        ? varsayilanAnonsMetni(yon)
        : mevcut.anonsMetni,
  };
}

/**
 * Hazir yogunlugu MEVCUT matrise uygular (tum vakitler, tum seviyeler).
 *
 * SOZLESME: preset esik + siklik + KANALLAR + ACILIYET yazar. Korunan kullanici verileri
 * `anonsMetni` ve BILDIRIM SESI secimidir (`bildirimSesi`/`sesAdi`) — sesi preset'in
 * yazmasi, kullanicinin sectigi muzigi her preset dokunusunda silerdi. Elle yapilan
 * zamanlama degisiklikleri zaten `ozelMatrisYedegi` ile saklanir → veri kaybi yok.
 *
 * ZAMANLAMA YONE GORE SECILIR: `seviyeler` CIKIS tablosudur; giris yonlu vakitler
 * `girisZamanlamasiniSec(vakit, yogunluk)` tablosunu alir. `yogunluk` verilmezse
 * (ya da 'ozel'/bozuksa) giris tarafi `GIRIS_VARSAYILAN_YOGUNLUK`'a duser.
 */
export function presetUygula(
  matris: MuhafizMatrisi,
  seviyeler: PresetSeviyeleri,
  sesliIzinVar: boolean,
  yogunluk?: unknown
): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    const giris = girisZamanlamasiVarsa(sonuc[v], v, yogunluk);
    sonuc[v].seviyeler = sonuc[v].seviyeler.map((s, i) =>
      seviyeyeUygula(
        s,
        seviyeler[SEVIYE_KADEMELERI[i]],
        sesliIzinVar,
        sonuc[v].yon,
        giris?.[SEVIYE_KADEMELERI[i]]
      )
    );
    // Preset zamanlamayi ezdi → ayrilan yonun yedegi BAYAT. Birakilsaydi
    // "ozel cikis → girise gec → preset → cikisa don" zincirinde kullaniciya
    // silinmis olmasi gereken eski ozel ayari geri verirdik.
    sonuc[v].yonYedegi = undefined;
  }
  return sonuc;
}

/** Vakit giris yonlu ise o vaktin giris tablosu, degilse `undefined`. */
function girisZamanlamasiVarsa(
  vakitAyari: VakitMuhafizAyari,
  vakit: MuhafizVakti,
  yogunluk?: unknown
): ZamanlamaSeviyeleri | undefined {
  return (vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU) === 'girisindenItibaren'
    ? girisZamanlamasiniSec(vakit, yogunluk)
    : undefined;
}

/**
 * Preset'in YALNIZ ZAMANLAMASINI (esik + siklik) mevcut matrise uygular.
 *
 * NEDEN AYRI: bir kerelik preset gocu bunu kullanir. Gocun amaci ETKISIZ TEKRARI
 * kesmekti; kullanicinin uyari BICIMINI degistirmek degil. `presetUygula` kanallari +
 * aciliyeti de yazar — goc yolunda bu, "Yatsi'yi susturmus ama yogunlugu 'normal'
 * kalmis" kullanicinin secimini sessizce ezerdi (kanal degisikligi yogunlugu 'ozel'
 * YAPMAZ — spec 4.1 — yani boyle kullanici goc kapisindan gecer ve geri donusu de
 * yoktur: goc `ozelMatrisYedegi` yazmaz).
 *
 * Bu yuzden korunan alanlar: `kanallar`, `acilKanal`, `bildirimSesi`/`sesAdi`, `anonsMetni`.
 */
export function presetZamanlamasiniUygula(
  matris: MuhafizMatrisi,
  seviyeler: PresetSeviyeleri,
  yogunluk?: unknown
): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    const giris = girisZamanlamasiVarsa(sonuc[v], v, yogunluk);
    sonuc[v].seviyeler = sonuc[v].seviyeler.map((s, i) => {
      const kaynak = giris?.[SEVIYE_KADEMELERI[i]] ?? seviyeler[SEVIYE_KADEMELERI[i]];
      return { ...s, esikDk: kaynak.esikDk, siklik: kaynak.siklik };
    });
    sonuc[v].yonYedegi = undefined; // `presetUygula` ile ayni gerekce (bayat yedek).
  }
  return sonuc;
}

/**
 * Preset'ten SIFIRDAN matris uretir (mevcut matris yokken: ilk kurulum sihirbazi,
 * slice initialState).
 *
 * Sihirbaz yolu eskiden preset'i yalniz eski `esikler`/`sikliklar` alanlarina
 * yaziyordu; matris `eskidenMatriseGoc` ile turetildigi icin YALNIZ
 * bildirim kanali aciliyordu → sihirbazdan gecen kullanicida sesli preset'ler
 * calismiyordu.
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
          kanallar: VARSAYILAN_ACIK_KANALLAR,
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

/**
 * Yedekteki zamanlama HEDEF YONDE kullanilabilir mi?
 *
 * Diskten gelen yedek bozuk/kismi olabilir; dogrulanmadan geri yuklenirse tam
 * duzeltmek istedigimiz hatayi (yone aykiri siralama) geri getirir.
 */
function yonYedegiGecerliMi(
  yedek: YonZamanlamaYedegi[] | undefined,
  yon: PencereYonu
): yedek is YonZamanlamaYedegi[] {
  if (!Array.isArray(yedek) || yedek.length !== SEVIYE_KADEMELERI.length) return false;
  if (!yedek.every((y) => !!y && Number.isFinite(y.esikDk) && y.esikDk >= 1)) return false;
  return esikSiralamasiGecerliMi(yedek, yon);
}

/**
 * Bir vaktin YONUNU degistirir: metni cevirir, ZAMANLAMAYI hedef yone uygun
 * yeniden kurar ve ayrilan yonun zamanlamasini yedekler.
 *
 * NEDEN ZAMANLAMA DA DEGISMELI (yasanmis hata): eski yol yalniz metni cevirip
 * `yon`'u yaziyordu. Cikis esikleri (45/25/10/3) giris yonunde kaldiginda
 * kapsama `olcuDk >= esikDk` + "en BUYUK esik kazanir" kurali eskalasyonu
 * TERSINE cevirir — kullanici vakit girer girmez en sert tonu duyar, sure
 * gectikce naziklesir, en buyuk esikten sonra motor tumden susar. Ustelik
 * `esikSinirlariniHesapla` komsu kisitini girişte ters cevirdigi icin stepper da
 * tek degere kilitlenir ve kullanici elle de duzeltemez.
 *
 * VERI KAYBI YOK: ayrilan yonun esik+siklik'i `yonYedegi`'ne yazilir; geri
 * donuldugunde (dogrulanirsa) aynen geri gelir. Kanal, aciliyet, ses ve anons
 * metni HER IKI YONDE DE korunur — bu fonksiyon yalniz zamanlama tasir.
 *
 * Degisecek bir sey yoksa AYNI REFERANSI dondurur.
 *
 * @param hedefZamanlama Hedef yon icin TABAN tablo (yedek yoksa/bozuksa kullanilir).
 */
export function yonuDegistir(
  vakitAyari: VakitMuhafizAyari,
  hedefYon: PencereYonu,
  hedefZamanlama: ZamanlamaSeviyeleri
): VakitMuhafizAyari {
  const mevcutYon = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
  if (mevcutYon === hedefYon) return vakitAyari;

  // Metin cevirisi + `yon` alani tek yerden yazilir (mevcut sozlesme).
  const cevrilmis = yonDegisimindeMetniCevir(vakitAyari, hedefYon);

  const ayrilanYedek: YonZamanlamaYedegi[] = vakitAyari.seviyeler.map((s) => ({
    esikDk: s.esikDk,
    siklik: s.siklik,
  }));

  const mevcutYedek = vakitAyari.yonYedegi?.[hedefYon];
  const geriYuklenen = yonYedegiGecerliMi(mevcutYedek, hedefYon) ? mevcutYedek : null;

  const seviyeler = cevrilmis.seviyeler.map((s, i) => {
    const kaynak = geriYuklenen ? geriYuklenen[i] : hedefZamanlama[SEVIYE_KADEMELERI[i]];
    return { ...s, esikDk: kaynak.esikDk, siklik: kaynak.siklik };
  });

  return {
    ...cevrilmis,
    yon: hedefYon,
    seviyeler,
    // Hedef yonun yedegi TUKETILDI → silinir; ayrilan yonunki yazilir.
    yonYedegi: { ...vakitAyari.yonYedegi, [hedefYon]: undefined, [mevcutYon]: ayrilanYedek },
  };
}

/** Bir vaktin yonunu degistirir; giris tablosu yogunluktan secilir. */
export function vaktinYonunuDegistir(
  vakitAyari: VakitMuhafizAyari,
  vakit: MuhafizVakti,
  hedefYon: PencereYonu,
  cikisZamanlamasi: ZamanlamaSeviyeleri,
  yogunluk?: unknown
): VakitMuhafizAyari {
  const hedefZamanlama =
    hedefYon === 'girisindenItibaren'
      ? girisZamanlamasiniSec(vakit, yogunluk)
      : cikisZamanlamasi;
  return yonuDegistir(vakitAyari, hedefYon, hedefZamanlama);
}

const siklikDk = (s: Siklik): number => (s === 'birkez' ? -1 : s.herDk);

export function zamanlamaDegistiMi(a: MuhafizMatrisi, b: MuhafizMatrisi): boolean {
  // Yalnız esikDk + siklik karşılaştırılır (kanal/ses/anons zamanlama ekseni değil).
  for (const v of MUHAFIZ_VAKITLERI) {
    const as = a[v].seviyeler, bs = b[v].seviyeler;
    for (let i = 0; i < as.length; i++) {
      if (as[i].esikDk !== bs[i].esikDk) return true;
      if (siklikDk(as[i].siklik) !== siklikDk(bs[i].siklik)) return true;
    }
  }
  return false;
}
