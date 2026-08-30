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
 * Bildirim basligi: <ikon> <sure> dk · <vakit adi> vakti <durum>
 *
 * `olcuDk` SEVIYEYI KAZANDIRAN olcudur (`UyariPlani.olcuDk`), zamanlama icin
 * kullanilan `kalanDk` DEGIL: giris yonunde ikisi farklidir.
 *
 * YON (Faz 1 / B11): cikis dili giris yonunde yalniz garip degil YANLIStir —
 * yatsi 700 dk surerken "acil" adim girisin 45. dakikasinda tetiklenir ve cikisa
 * hala 655 dk vardir; cikis basligi "🚨 655 dk · YATSI VAKTİ ÇIKIYOR" derdi.
 * Yon verilmezse cikis dili BIREBIR korunur (sifir goc).
 */
export function basligiOlustur(
  vakit: VakitAdi,
  seviye: MuhafizSeviye,
  olcuDk: number,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): string {
  const ad = VAKIT_ADLARI[vakit];
  if (yon === 'girisindenItibaren') {
    // Sure yine ikondan hemen sonra: Android daraltilmis bildirimde basligin
    // sonunu kirpar (cikis yonuyle ayni kural).
    switch (seviye) {
      case 1:
        return `⏰ ${olcuDk} dk oldu · ${ad} vakti girdi`;
      case 2:
        return `⚠️ ${olcuDk} dk oldu · ${ad} namazını geciktirme`;
      case 3:
        return `🔥 ${olcuDk} dk oldu · ${ad} namazı seni bekliyor`;
      case 4:
        return `🚨 ${olcuDk} dk oldu · ${VAKIT_ADLARI_BUYUK[vakit]} NAMAZINA DUR`;
    }
  }
  switch (seviye) {
    case 1:
      return `⏰ ${olcuDk} dk · ${ad} vakti`;
    case 2:
      return `⚠️ ${olcuDk} dk · ${ad} vakti daralıyor`;
    case 3:
      return `🔥 ${olcuDk} dk · ${ad} vakti kaçıyor`;
    case 4:
      return `🚨 ${olcuDk} dk · ${VAKIT_ADLARI_BUYUK[vakit]} VAKTİ ÇIKIYOR`;
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
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): string {
  // Giris yonunde yedek govde de notr havuzun ILK maddesidir (rastgelelik
  // cagirana ait; burasi deterministik yedektir).
  if (yon === 'girisindenItibaren') return GIRIS_ICERIK_HAVUZU[seviye][0];
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
