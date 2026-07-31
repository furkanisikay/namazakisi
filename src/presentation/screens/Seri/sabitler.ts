/**
 * Seri sekmesi — gök sahnesi renk tonları ve hareket zamanlama sabitleri.
 *
 * BİLİNÇLİ İSTİSNA (AGENTS.md "ASLA hardcoded renk" kuralı): aşağıdaki tonlar
 * temada karşılığı OLMAYAN, koyu gök paneline özgü dekoratif renklerdir (bkz.
 * tasarım spec `docs/superpowers/specs/2026-07-29-seri-sekmesi-takimyildizi-design.md`
 * §1 "Gök paneli"). Gök zemini iki temada da (açık/koyu) sabit koyu kalır —
 * "gökyüzü bir yüzey değil, bir dünya" kararı. Bu TEK istisnadır: gövde metni,
 * etiketler ve gök panelinin DIŞINDAKİ her şey daima `useRenkler` tema token'ı
 * kullanır. Yeni bir ton eklemek spec değişikliği gerektirir — bu tam liste,
 * ekleme/çıkarma buradan değil önce spec'ten yapılır.
 *
 * Yıldızın hâlesi/hüzmeleri BURADA YOK — onlar `renkler.birincil`'den gelir
 * (kullanıcının seçtiği palet rengi); yalnızca gök sahnesinin sabit kısımları
 * burada toplanır.
 */

/** Gök sahnesi ton tablosu (spec §1, tam liste). */
export const GOK_TONLARI = {
  /** Gök zemini gradyanının en koyu/temel katmanı (linear-gradient alt ucu). */
  ZEMIN_KOYU: '#080B16',
  /** Gök zemini gradyanının orta katmanı (linear-gradient üst ucu). */
  ZEMIN_ORTA: '#111830',
  /** Sol-üst radial vurgu katmanı (panelin köşesine derinlik katar). */
  ZEMIN_VURGU_SOL_UST: '#1B2440',
  /** Sağ-alt radial vurgu katmanı (ikinci, daha soluk derinlik noktası). */
  ZEMIN_VURGU_SAG_ALT: '#17203C',

  /** Yıldız ışığı: ışın çizgileri + çekirdek. NOT: `Tesbih.tsx`'teki boncuk
   * ışık noktası bu tonu KULLANMAZ — o, tema token'ı `renkler.birincilMetin`
   * ile çizilir (gök paneliyle aynı sahne değil, kendi tema kuralına tabidir;
   * inceleme bulgusu — önceden bu yorum ikisinin de aynı tonu paylaştığını
   * yanlış iddia ediyordu). */
  ISIK: '#F2F6FF',
  /** 5/5 (beş vakit tamam) çekirdeğinin beyaz-sıcak rengi. */
  BEYAZ_CEKIRDEK: '#FFFFFF',

  /** Sönük (henüz kılınmamış) ışın rengi. */
  ISIN_SONUK: '#4E5A7C',
  /** Hiç kılınmamış günün yıldız çekirdeği (ışık yok, yer belli). */
  CEKIRDEK_KILINMAMIS: '#6B77A0',
  /** Gelecek günün tek küçük noktası. */
  NOKTA_GELECEK: '#4A5470',
  /** Dondurulmuş (özel) günün kesikli halkası ve çekirdeği. */
  DONDURULMUS: '#9AA6C4',

  /** Izgaradaki gün numaraları (1, 2, 3…). İnceleme bulgusu (son inceleme):
   * eski `#63709A` en açık gök zemini noktasına (`ZEMIN_VURGU_SOL_UST`
   * `#1B2440`, `GokPaneli`'ndeki `zeminSolUst` radial vurgunun cx %22/cy %8
   * merkezinde tam opaklıkla) karşı yalnız **3.14:1** veriyordu — AA eşiği
   * 4.5:1'in (18.66px altı metin) ALTINDA. Ölçülen (`kontrastOrani`,
   * `src/core/utils/kontrastOrani.ts`): `#828EB0` vs `#1B2440` (en açık
   * zemin) → **4.69:1**; vs `#080B16` (en koyu zemin) → **6.02:1**. */
  GUN_NUMARASI: '#828EB0',
  /** Haftanın gün adları başlığı (P S Ç P C C P). İnceleme bulgusu: eski
   * `#6E7897` en açık zemine karşı **3.49:1** veriyordu (AA altı). Ölçülen:
   * `#8994AF` vs `#1B2440` (en açık zemin) → **5.04:1**; vs `#080B16` (en
   * koyu zemin) → **6.47:1**. GUN_NUMARASI'na göre bilerek biraz daha AÇIK
   * (kontrastı yüksek) bırakıldı — orijinal hiyerarşiyle aynı yön (gün
   * adları > gün numaraları), yalnız ikisi de artık eşiği geçiyor. */
  GUN_ADI: '#8994AF',
  /** Ay adı başlığı ("Temmuz 2026"). */
  AY_ADI: '#E8EDF8',
  /** Ay gezinme okları (bu fazda kullanılmıyor — spec §7 kapsam dışı, ok gizli). */
  AY_OKU: '#8892AC',
} as const;

/**
 * Açılış zinciri zamanlaması (Faz 2 — animasyon bu fazda YOK, sabitler
 * yalnız burada hazırlanıyor). Zincir SIRAYLA örülür: bir bağlantı bitmeden
 * sonraki başlamaz (bkz. spec §2 "Açılış — zincir SIRAYLA örülür").
 */
export const GOK_ZAMANLAMA = {
  /** Yıldız yandıktan sonra ona giden çizginin başlamasına kadarki gecikme (ms). */
  CIZGI_ONCE_MS: 30,
  /** Normal bağın çizilme süresi (ms). */
  SEG_NORMAL_MS: 85,
  /** 5/5 ↔ 5/5 bağının çizilme süresi — daha ağır/vurgulu (ms). */
  SEG_VURGU_MS: 130,
  /** Zincir kopukken geçilen kısa es (ms) — bağ kurulmaz, yalnız zaman ilerler. */
  KOPUK_BOSLUK_MS: 32,

  /** 5/5 günlerin sürekli parıltısının taban süresi (ms); her yıldız buna
   * `PARILTI_SURE_FAZ_ARALIGI_MS` içinde DETERMİNİSTİK (yıldız indeksinden
   * türetilen, `Math.random` DEĞİL) bir pay ekler (faz farkı — senkron
   * yanıp sönme yapay durur). Aralık: 4600–7200 ms. */
  PARILTI_SURE_TABAN_MS: 4600,
  /** Parıltı süresi faz-farkı aralığı (ms) — bkz. yukarı. */
  PARILTI_SURE_FAZ_ARALIGI_MS: 2600,
  /** Parıltının açılış zinciri bittikten kaç ms sonra başladığı (taban). */
  PARILTI_GECIKME_SONRASI_MS: 700,
  /** Parıltı başlama gecikmesi faz-farkı aralığı (ms). */
  PARILTI_GECIKME_FAZ_ARALIGI_MS: 1800,
  /** Faz farkını üretmek için yıldız indeksiyle çarpılan asal sayı (süre). */
  PARILTI_FAZ_CARPANI_SURE: 617,
  /** Faz farkını üretmek için yıldız indeksiyle çarpılan asal sayı (gecikme). */
  PARILTI_FAZ_CARPANI_GECIKME: 431,

  /** Bugünün karesinin nabız animasyonu süresi (ms) — 3.2 sn, sabit. */
  NABIZ_SURE_MS: 3200,

  /** Yıldız girişi — 5/5 (en vurgulu, en uzun): opacity 0→1 (task-2-brief.md
   * §2b). Ölçek taşması KULLANILMAZ (bkz. AnimasyonluYildiz.tsx doc-block,
   * "(b) Ölçekten vazgeç" seçildi) — kademe farkı süre + içeriğin zenginliğiyle
   * (hüzmeler/hâle/beyaz çekirdek) korunur. */
  GIRIS_TAM_MS: 380,
  /** Yıldız girişi — hedef tuttu (halka var, taşma/parıltı YOK): opacity 0→1. */
  GIRIS_HEDEF_MS: 300,
  /** Yıldız girişi — diğerleri (yalnız soluklaşma): opacity 0→1. */
  GIRIS_SADE_MS: 240,
} as const;
