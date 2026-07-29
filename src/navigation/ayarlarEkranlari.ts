/**
 * Ayarlar stack'indeki ekran adlarının TEK KAYNAĞI.
 *
 * `AppNavigator.tsx` bu listeden bir `Record` ile ekran haritası üretir —
 * `Record<AyarlarEkranAdi, ...>` tüm adları zorunlu kıldığı için liste ile
 * gerçek `<Stack.Screen>` tanımları ayrışırsa `npm run typecheck` düşer
 * (nöbetçi TEST değil, DERLEME ZAMANI garantisi — bkz. task-1-brief.md).
 *
 * `src/core/ayarlar/aramaIndeksi.ts` de her kaydın `sayfa` alanı için bu
 * tipi `import type` ile kullanır (runtime bağ kurmaz, `src/core/` saf kalır).
 */
export const AYARLAR_EKRANLARI = [
  'AyarlarAna',
  'KonumAyarlari',
  'GorünumAyarlari',
  'BildirimAyarlari',
  'SeriHedefAyarlari',
  'MuhafizAyarlari',
  'Hakkinda',
  'RamazanAyarlari',
  'DebugLogs',
  'TakvimAyarlari',
  'NelerYeni',
  'YedeklemeAktarim',
  'IceAktarmaSihirbazi',
  'TaniGeriBildirim',
] as const;

export type AyarlarEkranAdi = (typeof AYARLAR_EKRANLARI)[number];

/** `vurgula` çapası olan HER hedef sayfaya gidebilir (vurgu altyapısı sonraki görevde). */
export type AyarlarStackParamList = Record<AyarlarEkranAdi, { vurgula?: string } | undefined>;
