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
  'GorünumAyarlari', // dil-haric: kimlik (rota adı)
  // Arayüz dili (seçicide birden çok dil varken Ayarlar'da satırı görünür)
  'DilAyarlari',
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
  // Cihaz ağı: bağlı TV'ler + saat (tasarım 2026-10-21); TV ekleme aşağıdaki sayfada
  'Cihazlarim',
  // Telefon ↔ tablet eşleştirme (kod göster / okut)
  'CihazEkle',
  // Android TV ekleme (QR ya da 7 haneli kod)
  'TelevizyonAyarlari',
  'KildimUygulamalari',
  'OtomasyonRehberi',
  'DebugLogs',
  'TakvimAyarlari',
  'SeferilikAyarlari',
  // Hesap yöntemi (ülkeye göre takvim, ikindi, dakika düzeltmesi)
  'HesapYontemiAyarlari',
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
type OrtakAyarParametreleri = { vurgula?: string; ac?: boolean };

/**
 * `namazakisi://tv?v=1&a=…&p=…&k=…` derin bağlantısının sorgu alanları (iPhone kamerasıyla
 * okutulan TV QR'ı). React Navigation sorguyu dize parametrelere çevirir; sayfa onları tek
 * doğrulama kapısından (`tvQrCoz`) geçirir.
 */
export type TvDerinParametreleri = { v?: string; a?: string; p?: string; k?: string; i?: string; s?: string; d?: string };

export type AyarlarStackParamList = Record<AyarlarEkranAdi, OrtakAyarParametreleri | undefined> & {
  TelevizyonAyarlari: (OrtakAyarParametreleri & TvDerinParametreleri) | undefined;
};
