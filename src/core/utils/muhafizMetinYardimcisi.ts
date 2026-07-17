/**
 * Muhafiz bildirim metinleri (saf).
 *
 * Baslik uretimi eskiden ArkaplanMuhafizServisi'nin planlama dongusunde inline
 * sabit atamalardaydi -> test edilemiyordu. Buraya cikarildi.
 *
 * Kalan sure BASLIKTA ve daima ikondan hemen sonra: Android daraltilmis
 * bildirimde basligi + govdenin basini gosterir; sure sonda olursa kirpilir.
 */
import type { VakitAdi } from '../types';

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
 * Bildirim basligi: <ikon> <sure> dk · <vakit adi> vakti <durum>
 */
export function basligiOlustur(
  vakit: VakitAdi,
  seviye: MuhafizSeviye,
  kalanDk: number
): string {
  const ad = VAKIT_ADLARI[vakit];
  switch (seviye) {
    case 1:
      return `⏰ ${kalanDk} dk · ${ad} vakti`;
    case 2:
      return `⚠️ ${kalanDk} dk · ${ad} vakti daralıyor`;
    case 3:
      return `🔥 ${kalanDk} dk · ${ad} vakti kaçıyor`;
    case 4:
      return `🚨 ${kalanDk} dk · ${VAKIT_ADLARI_BUYUK[vakit]} VAKTİ ÇIKIYOR`;
  }
}

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
export function bildirimGovdesiOlustur(seviye: MuhafizSeviye): string {
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
