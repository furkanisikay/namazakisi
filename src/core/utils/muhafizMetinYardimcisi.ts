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
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from '../muhafiz/pencereTipleri';

export type MuhafizSeviye = 1 | 2 | 3 | 4;

export const VAKIT_ADLARI: Record<VakitAdi, string> = {
  imsak: 'Sabah',
  gunes: 'Güneş',
  ogle: 'Öğle',
  ikindi: 'İkindi',
  aksam: 'Akşam',
  yatsi: 'Yatsı',
};

/**
 * DIKKAT: toUpperCase() KULLANMA.
 * 'İkindi'.toUpperCase() -> 'İKINDI' (noktali İ kaybolur, i -> I).
 * toLocaleUpperCase('tr-TR') dogru sonuc verir ama Hermes'te Intl/ICU
 * varligina baglidir -> sabit harita motordan bagimsiz ve kesindir.
 */
export const VAKIT_ADLARI_BUYUK: Record<VakitAdi, string> = {
  imsak: 'SABAH',
  gunes: 'GÜNEŞ',
  ogle: 'ÖĞLE',
  ikindi: 'İKİNDİ',
  aksam: 'AKŞAM',
  yatsi: 'YATSI',
};

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
  if (yon === 'girisindenItibaren') {
    switch (seviye) {
      case 1:
        return `${ad} · ${olcuDk} dk oldu · vakit girdi ⏰`;
      case 2:
        return `${ad} · ${olcuDk} dk oldu · namazını geciktirme ⚠️`;
      case 3:
        return `${ad} · ${olcuDk} dk oldu · namazı seni bekliyor 🔥`;
      case 4:
        return `${buyukAd} · ${olcuDk} dk oldu · NAMAZINA DUR 🚨`;
    }
  }
  if (!sonDakikaDiliMi(seviye, olcuDk)) {
    // Erken sert/acil: vakit daralmadi — notr ama yine "sen" kaydinda.
    return seviye === 4
      ? `${buyukAd} · ${olcuDk} dk kaldı · NAMAZINA DUR 🚨`
      : `${ad} · ${olcuDk} dk kaldı · namazı seni bekliyor 🔥`;
  }
  switch (seviye) {
    case 1:
      return `${ad} · ${olcuDk} dk kaldı ⏰`;
    case 2:
      return `${ad} · ${olcuDk} dk · vakit daralıyor ⚠️`;
    case 3:
      return `${ad} · ${olcuDk} dk · vakit kaçıyor 🔥`;
    case 4:
      return `${buyukAd} · ${olcuDk} dk · VAKİT ÇIKIYOR 🚨`;
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
export const GIRIS_ICERIK_HAVUZU: Record<MuhafizSeviye, string[]> = {
  1: [
    'Namaz vakti girdi; fırsat varken kıl.',
    'Vakit senin lehine işlerken kıl, sonraya kalmasın.',
  ],
  2: [
    'Erteledikçe ağırlaşır; namazı sona bırakma.',
    'Vakit ilerliyor — namazını şimdi kıl.',
  ],
  3: [
    'Namazı geciktirdikçe kaçırmaya yaklaşırsın; hemen kıl.',
    'Şeytan şu an sana "Sonra kılarsın" diye fısıldıyor. Onu dinleme!',
    'Birkaç dakika sonra "keşke" demek yerine şimdi kalk.',
  ],
  4: [
    'Namazı daha fazla geciktirme — hemen namaza dur.',
    'Bırak elindekini, namaza dur.',
  ],
};

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
  switch (seviye) {
    case 1:
      return 'Vakit daralmaya başladı, fırsat varken kıl.';
    case 2:
      return 'Namazı sona bırakma; şimdi kılmak için vakit uygun.';
    case 3:
      return 'Şeytana uyma, namazı kıl!';
    case 4:
      return 'Hemen namaza dur — sonra kaza etmek zorunda kalırsın.';
  }
}
