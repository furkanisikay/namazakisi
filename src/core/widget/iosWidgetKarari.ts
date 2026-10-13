/**
 * iOS ana ekran / kilit ekranı widget'ı ve StandBy — GÖRÜNÜM KARARI (issue #295). SAF.
 *
 * Swift ikizi `modules/expo-siri-kisayollari/ios/WidgetKarari.swift`'tir (widget
 * uzantısına da kopyalanır). İki taraf ORTAK fikstürle kilitlidir:
 * `modules/expo-siri-kisayollari/test/widget-ios-ornek.json` (JS testi + Swift test
 * koşucusu `test/main.swift`). Kural değişirse TS + Swift + fikstür BİRLİKTE değişir.
 *
 * Kurallar:
 *  - Aktif vakit, çıkış ve sıradaki vakit `aktifVakitBul`'dan gelir (widget/Kotlin/Swift
 *    ortak sözleşmesi) — burada yeniden yazılmaz.
 *  - Kılınmışlık = kaydedilmiş kılınanlar ∪ kuyrukta bekleyen "Kıldım" (Siri, widget
 *    düğmesi): kuyruk işlenmeden widget "kılınmadı" deyip titremesin.
 *  - Gösterilen GÜN namaz günüdür: aktif vakit varsa onun günü (gece yarısından sonra
 *    yatsı dünündür), yoksa son geçen girişin günü, o da yoksa sıradaki vaktin günü.
 *  - Zaman çizelgesi girdileri YALNIZ vakit sınırlarındadır (`sinirlar`); dakikalık
 *    girdi YOK — geri sayımı sistem çizer (`Text(timerInterval:)`).
 */
import { aktifVakitBul, widgetKoduVakitAdina, WIDGET_KILINABILIR, type WidgetVakitAni } from './widgetYuku';

/** Bir zaman çizelgesinde en fazla bu kadar sınır girdisi (~2 gün). */
export const IOS_WIDGET_AZAMI_SINIR = 12;

export interface IosBekleyenKildim {
  tarih: string;
  /** KAYIT vakit kodu (`imsak`, `ogle`...). */
  vakit: string;
}

export interface IosWidgetGorunumu {
  aktif: WidgetVakitAni | null;
  bitisMs: number | null;
  kilindi: boolean;
  sonraki: WidgetVakitAni | null;
  gunTarihi: string | null;
}

/** Kılınmışlık: kaydedilmiş (widget kodu) ∪ kuyrukta bekleyen (kayıt kodu). */
export function iosKilindiMi(
  vakit: WidgetVakitAni,
  kilinanlar: Record<string, string[]>,
  bekleyenler: readonly IosBekleyenKildim[]
): boolean {
  if ((kilinanlar[vakit.tarih] ?? []).includes(vakit.vakit)) return true;
  const kayit = widgetKoduVakitAdina(vakit.vakit);
  if (!kayit) return false;
  return bekleyenler.some((b) => b.tarih === vakit.tarih && b.vakit === kayit);
}

export function iosWidgetGorunumu(
  vakitler: readonly WidgetVakitAni[],
  kilinanlar: Record<string, string[]>,
  bekleyenler: readonly IosBekleyenKildim[],
  simdiMs: number
): IosWidgetGorunumu {
  const durum = aktifVakitBul(vakitler, simdiMs);
  const sirali = [...vakitler].sort((a, b) => a.ms - b.ms);
  const sonGecen = sirali.filter((v) => v.ms <= simdiMs).pop() ?? null;
  const gunTarihi = durum.aktif?.tarih ?? sonGecen?.tarih ?? durum.sonraki?.tarih ?? null;
  return {
    aktif: durum.aktif,
    bitisMs: durum.bitisMs,
    kilindi: durum.aktif ? iosKilindiMi(durum.aktif, kilinanlar, bekleyenler) : false,
    sonraki: durum.sonraki,
    gunTarihi,
  };
}

/** Şu andan SONRAKİ vakit girişleri (güneş dahil), sıralı ve tekil — zaman çizelgesi girdileri. */
export function iosWidgetSinirlari(
  vakitler: readonly WidgetVakitAni[],
  simdiMs: number,
  azami: number = IOS_WIDGET_AZAMI_SINIR
): number[] {
  const anlar = [...new Set(vakitler.map((v) => v.ms).filter((ms) => ms > simdiMs))].sort((a, b) => a - b);
  return anlar.slice(0, Math.max(0, azami));
}

/** Bir namaz gününün beş kılınabilir vakti (orta boy widget listesi), sıralı. */
export function iosGunVakitleri(vakitler: readonly WidgetVakitAni[], tarih: string): WidgetVakitAni[] {
  return vakitler
    .filter((v) => v.tarih === tarih && WIDGET_KILINABILIR.includes(v.vakit))
    .sort((a, b) => a.ms - b.ms);
}
