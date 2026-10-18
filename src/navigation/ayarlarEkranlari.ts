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
  // Sade tasarım (Dalga 3): görev bazlı yeni sayfalar
  'Hatirlatmalar',
  'VakitGirinceAyarlari',
  'CumaHatirlatmaAyarlari',
  'CamiyeGitAyarlari',
  'YatisHatirlatmaAyarlari',
  'TakvimCakismaAyarlari',
  'GunSonuAyarlari',
  'OzelGunAyarlari',
  'NamazVakitleriAyarlari',
  'SaatVeWidgetAyarlari',
  'Yardim',
  'Camilerim',
  'KonumAyarlari',
  'GorünumAyarlari',
  'BildirimAyarlari',
  'SeriHedefAyarlari',
  'MuhafizAyarlari',
  'Hakkinda',
  'RamazanAyarlari',
  'NafileAyarlari',
  'NowBarAyarlari',
  'CamideyimAyarlari',
  'NamazModuAyarlari',
  'SaatAyarlari',
  'KildimUygulamalari',
  'OtomasyonRehberi',
  'DebugLogs',
  'TakvimAyarlari',
  'SeferilikAyarlari',
  'NelerYeni',
  'YedeklemeAktarim',
  'IceAktarmaSihirbazi',
  'EsitlemeAyarlari',
  'TaniGeriBildirim',
] as const;

export type AyarlarEkranAdi = (typeof AYARLAR_EKRANLARI)[number];

/**
 * `vurgula` çapası olan HER hedef sayfaya gidebilir. `ac`: Hatırlatmalar'daki anahtar
 * ayrıntıda açma akışını başlatsın (rıza isteyen takvim çakışması).
 */
export type AyarlarStackParamList = Record<AyarlarEkranAdi, { vurgula?: string; ac?: boolean } | undefined>;
