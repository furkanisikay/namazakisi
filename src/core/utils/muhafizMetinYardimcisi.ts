/**
 * Muhafiz bildirim metinleri (saf).
 *
 * Baslik uretimi eskiden ArkaplanMuhafizServisi'nin planlama dongusunde inline
 * sabit atamalardaydi -> test edilemiyordu. Buraya cikarildi.
 *
 * Vakit adi + kalan sure BASLIGIN EN BASINDA: Android daraltilmis bildirimi
 * ve bileklikler (issue #287) basligin sonunu kirpar; sure sonda olursa kaybolur.
 */
import type { VakitAdi } from '../types';
import { bicim, canli, metin } from '../dil/aktifDil';
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from '../muhafiz/pencereTipleri';

export type MuhafizSeviye = 1 | 2 | 3 | 4;

/** Etkin dilde vakit adı (canlı görünüm: dil değişince yeni değeri okur). */
export const VAKIT_ADLARI: Readonly<Record<VakitAdi, string>> = canli((s) => s.vakit.adlar);

/**
 * DIKKAT: toUpperCase() KULLANMA.
 * 'İkindi'.toUpperCase() -> 'İKINDI' (noktali İ kaybolur, i -> I).
 * toLocaleUpperCase('tr-TR') dogru sonuc verir ama Hermes'te Intl/ICU
 * varligina baglidir -> sabit harita (sozluk `vakit.buyuk`) motordan bagimsiz ve kesindir.
 */
export const VAKIT_ADLARI_BUYUK: Readonly<Record<VakitAdi, string>> = canli((s) => s.vakit.buyuk);

/** Cumle icinde gecen kucuk harfli vakit adlari (sabit harita; `toLowerCase` YAZMA). */
export const VAKIT_ADLARI_KUCUK: Readonly<Record<VakitAdi, string>> = canli((s) => s.vakit.kucuk);

/**
 * METIN = (TON, OLCU) — issue #274.
 *
 * Ton artik sirayi ima etmedigi icin "sert" ya da "acil" tonlu bir adim vaktin
 * cikmasina 90 dk kala da kurulabilir. O anda "vakti KACIYOR / VAKTI CIKIYOR"
 * demek yalan olur (vakit daralmamistir) ve vakte ozgu nasslar yanlis kisiye
 * gider (AGENTS.md: terk etme ≠ geciktirme). Kural: cikis yonunde, sert/acil
 * ton icin olcu bu esigin USTUNDEYSE baslik ve govde NOTR kalip kullanir
 * ("namazi seni bekliyor"); gercek son dakikalar degismez.
 *
 * 30 dk: varsayilan matrisin sert adimi 10, en yogun preset'in 15 dk'dir →
 * mevcut hicbir kurulumun metni degismez (kayit-oynat nobetcisi).
 */
export const SON_DAKIKA_ESIGI_DK = 30;

/** Bu (ton, olcu) son dakika diliyle mi konusmali? (Yalniz cikis yonunde anlamli.) */
export const sonDakikaDiliMi = (seviye: MuhafizSeviye, olcuDk?: number): boolean =>
  seviye < 3 || olcuDk === undefined || !Number.isFinite(olcuDk) || olcuDk <= SON_DAKIKA_ESIGI_DK;

/**
 * Bant/saat ekraninda gorunen bas kisim (issue #287): Galaxy Fit, Mi Band,
 * Huawei Band telefon bildirimini aynalar ve basligin yalniz ilk ~12-16
 * karakterini gosterir. Vakit adi + sure bu sinirin icinde kalmali.
 */
export const BANT_GORUNUR_KARAKTER = 16;

/**
 * Bildirim basligi: <Vakit> · <sure> dk[ kaldi| oldu] · <durum> <ikon>
 *
 * ONDEN OKUNUR (issue #287): bileklikler ve daraltilmis Android bildirimi
 * basligin SONUNU kirpar → vakit adi ve sure EN BASTA durur, ton ikonu sona
 * gecer (bantta ikon cogu zaman kutu olarak cizilir; telefonda tonu hala
 * tasir). Ton/notr-kalip kurallari (#274) AYNEN gecerli; yalniz sira degisti.
 * Acil tonda vakit adi sabit buyuk harf haritasindan gelir (toUpperCase YASAK).
 *
 * `olcuDk` SEVIYEYI KAZANDIRAN olcudur (`UyariPlani.olcuDk`), zamanlama icin
 * kullanilan `kalanDk` DEGIL: giris yonunde ikisi farklidir.
 *
 * YON (Faz 1 / B11): cikis dili giris yonunde yalniz garip degil YANLIStir —
 * yatsi 700 dk surerken "acil" adim girisin 45. dakikasinda tetiklenir ve cikisa
 * hala 655 dk vardir; cikis basligi "YATSI · 655 dk · VAKİT ÇIKIYOR" derdi.
 * Yon verilmezse cikis dili kullanilir.
 */
export function basligiOlustur(
  vakit: VakitAdi,
  seviye: MuhafizSeviye,
  olcuDk: number,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): string {
  const ad = VAKIT_ADLARI[vakit];
  const buyukAd = VAKIT_ADLARI_BUYUK[vakit];
  const b = metin().muhafiz.baslik;
  const yaz = (sablon: string, buyuk = false) => bicim(sablon, { ad: buyuk ? buyukAd : ad, dk: olcuDk });
  if (yon === 'girisindenItibaren') {
    switch (seviye) {
      case 1:
        return yaz(b.giris1);
      case 2:
        return yaz(b.giris2);
      case 3:
        return yaz(b.giris3);
      case 4:
        return yaz(b.giris4, true);
    }
  }
  if (!sonDakikaDiliMi(seviye, olcuDk)) {
    // Erken sert/acil: vakit daralmadi — notr ama yine "sen" kaydinda.
    return seviye === 4 ? yaz(b.erken4, true) : yaz(b.erken3);
  }
  switch (seviye) {
    case 1:
      return yaz(b.cikis1);
    case 2:
      return yaz(b.cikis2);
    case 3:
      return yaz(b.cikis3);
    case 4:
      return yaz(b.cikis4, true);
  }
}

/**
 * GIRIS yonunun NOTR icerik havuzu.
 *
 * `SEYTANLA_MUCADELE_ICERIGI` havuzu cikis yonu icin yazildi: "Vakit daralmaya
 * basladi", "Son dakikalar" gibi metinler ve VAKTE OZGU nasslar vaktin sonuna
 * kuruludur -> giris yonunde kullanilamaz (AGENTS.md: vakte ozgu nassi genel
 * havuza koyma).
 *
 * FIKIH: bildirimi alan kisi namazi TERK etmis degil, GECIKTIRMISTIR — dil
 * "geciktirme / namaza dur" ekseninde kalir; terk/kufur nassi bu kisiye yanlis
 * hedeftir. "Secdeye kapan" da YAZILMAZ (secde namazin icindeki rukun).
 */
export const GIRIS_ICERIK_HAVUZU: Readonly<Record<MuhafizSeviye, readonly string[]>> = canli((s) => ({
  1: s.muhafiz.girisHavuzu.s1,
  2: s.muhafiz.girisHavuzu.s2,
  3: s.muhafiz.girisHavuzu.s3,
  4: s.muhafiz.girisHavuzu.s4,
}));

/**
 * Bildirim govdesi. Vakit adi ve kalan sure ALMAZ - ikisi de baslikta.
 * Seviye 3'un govdesi havuzdan gelir (bkz. ArkaplanMuhafizServisi); buradaki
 * seviye 3 metni yalnizca havuz bos oldugunda kullanilan YEDEKtir.
 *
 * DIL: Muhafiz, AGENTS.md'deki "kibar siz dili" kuralinin BILINCLI ISTISNASIDIR
 * -- ic ses / sert koc kaydi: sen dili + emir kipi. Bkz. AGENTS.md "Metin dili:
 * aray uz vs ibadet-hatirlatma". Aray uz metinlerinde (ayarlar/buton/hata) siz.
 *
 * "Secdeye kapan" DEGIL "namaza dur": secde namazin icindeki bir rukun, baslangici
 * degil -- vakit daralinca kisi namaza durur, secdeye kapanmaz.
 */
export function bildirimGovdesiOlustur(
  seviye: MuhafizSeviye,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
  olcuDk?: number
): string {
  // Giris yonunde yedek govde de notr havuzun ILK maddesidir (rastgelelik
  // cagirana ait; burasi deterministik yedektir). Erken sert/acil (cikis
  // yonunde son dakikalar DEGIL) de ayni notr havuzu kullanir — issue #274.
  if (yon === 'girisindenItibaren' || !sonDakikaDiliMi(seviye, olcuDk)) {
    return GIRIS_ICERIK_HAVUZU[seviye][0];
  }
  const g = metin().muhafiz.govde;
  switch (seviye) {
    case 1:
      return g.s1;
    case 2:
      return g.s2;
    case 3:
      return g.s3;
    case 4:
      return g.s4;
  }
}

/**
 * GECE SESSİZLİĞİ ÇAPASI METİNLERİ (yatsı uyarısı sessizlik başlangıcına çapalandığında).
 *
 * Çapalı uyarıda vakit ÇIKMIYOR — yalnız gece sessizliği başlıyor. "Vakit çıkıyor",
 * "son N dakika", "kaçıyor" ve vaktin sonuna özgü nass bu yüzden KULLANILMAZ (yalan olur).
 * Kayıt ibadete çağrıdır ("sen" + emir), suçlama yok. Başlık önden okunur (vakit adı başta).
 * Telefon (arka plan + ön plan) ve saat yükü bu üç değerden üretir. Nöbetçi:
 * `geceSessizligi.test.ts > ÇAPALI METİN`.
 */
export function geceCapasiBasligi(vakit: VakitAdi): string {
    return bicim(metin().muhafiz.geceCapasi.baslik, { ad: VAKIT_ADLARI[vakit] });
}

/** Gövde — `kalanDk` sessizliğin başlangıcına kalan dakikadır (vaktin çıkışına DEĞİL). */
export function geceCapasiGovdesi(kalanDk: number): string {
    return bicim(metin().muhafiz.geceCapasi.govde, { dk: kalanDk });
}

/** Sesli okuma şablonu ({vakit}, {süre} yer tutucuları `anonsMetniniCoz` ile çözülür), etkin dilde. */
export const geceCapasiAnonsSablonu = (): string => metin().anons.otomatik.geceCapasi;
