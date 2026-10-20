/**
 * iPhone "Namazda sessiz" — vakit girişinden sonraki sessizlik penceresi (SAF).
 *
 * iOS bir uygulamanın sessiz modu ya da Odak'ı kendisinin açmasına İZİN VERMEZ.
 * Apple'ın izin verdiği yol: kullanıcının Kısayollar otomasyonu "Odak'ı ayarla" eylemini
 * çalıştırır; o otomasyon ne zaman açacağını bizim App Intent'imize sorar
 * ("Namaz sessizliği" → doğru/yanlış, "Namaz sessizliğinin bitişi" → saat).
 * Kısayollar'ın saat tetikleri SABİT saattir, değişen vakitlere uymaz; bu yüzden karar
 * uygulamanın kendi vakit çizelgesinden (widget yükü, `SiriDeposu`) verilir.
 *
 * Kural tek cümle: içinde bulunulan namaz vaktinin GİRİŞİNDEN itibaren `dakika` süre
 * boyunca "sessiz"; pencere vaktin çıkışını geçmez. Güneş vakti namaz değildir.
 *
 * BU DOSYA `modules/expo-siri-kisayollari/ios/SessizlikKarari.swift`'İN İKİZİDİR.
 * Ortak fikstür: `modules/expo-siri-kisayollari/test/siri-ornek.json > sessizlik`
 * (JS testi ve Swift test koşucusu aynı dosyayı okur). Kural değişirse üçü birlikte.
 */
import { aktifVakitBul, WIDGET_KILINABILIR, type WidgetVakitAni, type WidgetVakitKodu } from '../widget/widgetYuku';

export const SESSIZLIK_VARSAYILAN_DK = 20;
export const SESSIZLIK_EN_AZ_DK = 5;
export const SESSIZLIK_EN_COK_DK = 120;

/** Kısayoldaki süre parametresi her değeri alabilir → güvenli aralığa çek. */
export function sessizlikDakikasiniKenetle(dakika: number): number {
    if (!Number.isFinite(dakika)) return SESSIZLIK_VARSAYILAN_DK;
    return Math.min(SESSIZLIK_EN_COK_DK, Math.max(SESSIZLIK_EN_AZ_DK, Math.round(dakika)));
}

export interface SessizlikDurumu {
    sessiz: boolean;
    /** Sessizken içinde bulunulan vakit, değilse null. */
    vakit: WidgetVakitKodu | null;
    /** Sessizken pencerenin sonu, değilse null. */
    bitisMs: number | null;
}

export function namazSessizligi(vakitler: readonly WidgetVakitAni[], simdiMs: number, dakika: number): SessizlikDurumu {
    const durum = aktifVakitBul(vakitler, simdiMs);
    if (!durum.aktif || durum.bitisMs == null) return { sessiz: false, vakit: null, bitisMs: null };
    const son = Math.min(durum.aktif.ms + sessizlikDakikasiniKenetle(dakika) * 60_000, durum.bitisMs);
    if (simdiMs >= son) return { sessiz: false, vakit: null, bitisMs: null };
    return { sessiz: true, vakit: durum.aktif.vakit, bitisMs: son };
}

export interface SessizlikPenceresi {
    vakit: WidgetVakitKodu;
    baslangicMs: number;
    bitisMs: number;
}

/** Bir namaz gününün pencereleri — ekrandaki "Bugün" önizlemesi için. */
export function gununSessizlikPencereleri(
    vakitler: readonly WidgetVakitAni[],
    tarih: string,
    dakika: number
): SessizlikPenceresi[] {
    const sirali = [...vakitler].sort((a, b) => a.ms - b.ms);
    const sure = sessizlikDakikasiniKenetle(dakika) * 60_000;
    const sonuc: SessizlikPenceresi[] = [];
    sirali.forEach((v, i) => {
        const sonraki = sirali[i + 1];
        if (v.tarih !== tarih || !WIDGET_KILINABILIR.includes(v.vakit) || !sonraki) return;
        sonuc.push({ vakit: v.vakit, baslangicMs: v.ms, bitisMs: Math.min(v.ms + sure, sonraki.ms) });
    });
    return sonuc;
}
