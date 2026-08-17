/**
 * Ayarlar aramasının tarayacağı sabit indeks.
 *
 * BİLİNÇLİ OLARAK SINIRLIDIR: her ayar burada YOKTUR, yalnız kullanıcının
 * en çok arayacağı satırlar — (a) Ayarlar ana sayfasındaki 11 navigasyon
 * satırı (çapasız, yalnız ilgili sayfaya götürür) ve (b) 17 alt-ayar çapası
 * (`capalar.ts`, `CapaId`). Bu listeyi "kapsamlı" sanıp genişletmeden önce
 * task-3-brief.md'yi oku. Titreşim ve Ses efektleri toggle'ları KASITLI
 * OLARAK indekslenmez — ikisi de `AyarlarAna`'da yaşar ve "dokununca nereye
 * gider?" sorusunun arama sonucu olarak anlamlı bir cevabı yok.
 *
 * `sayfa` alanı yalnız TİP olarak `AyarlarEkranAdi`'a bağlıdır (`import
 * type` — runtime bağ kurmaz); `src/core/` saf kalır (AGENTS.md).
 */
import type { AyarlarEkranAdi } from '../../navigation/ayarlarEkranlari';
import type { CapaId } from './capalar';

export interface AyarIndeksKaydi {
  id: string;
  baslik: string;
  anahtarKelimeler: string[];
  sayfa: AyarlarEkranAdi;
  /** Sonuçta bağlam olarak gösterilir (ör. "Bildirimler" grubu/sayfası). */
  grup: string;
  capa?: CapaId;
}

export const AYAR_INDEKSI: AyarIndeksKaydi[] = [
  // ── Ayarlar ana sayfasındaki navigasyon satırları (çapasız) ──────────────
  {
    id: 'sayfa-konum',
    baslik: 'Konum',
    anahtarKelimeler: ['konum', 'şehir', 'gps', 'yer'],
    sayfa: 'KonumAyarlari',
    grup: 'Namaz vakitleri',
  },
  {
    id: 'sayfa-takvim',
    baslik: 'Takvim entegrasyonu',
    anahtarKelimeler: ['takvim', 'etkinlik', 'senkronizasyon'],
    sayfa: 'TakvimAyarlari',
    grup: 'Namaz vakitleri',
  },
  {
    id: 'sayfa-muhafiz',
    baslik: 'Namaz muhafızı',
    anahtarKelimeler: ['muhafız', 'hatırlatma', 'uyarı'],
    sayfa: 'MuhafizAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'sayfa-bildirim',
    baslik: 'Bildirimler',
    anahtarKelimeler: ['bildirim', 'ezan', 'vakit bildirimi'],
    sayfa: 'BildirimAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'sayfa-seri',
    baslik: 'Seri ve hedefler',
    anahtarKelimeler: ['seri', 'hedef', 'puan', 'streak'],
    sayfa: 'SeriHedefAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'sayfa-ramazan',
    baslik: 'Ramazan özel',
    anahtarKelimeler: ['ramazan', 'iftar', 'sahur', 'oruç'],
    sayfa: 'RamazanAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'sayfa-gorunum',
    baslik: 'Görünüm',
    anahtarKelimeler: ['tema', 'renk', 'görünüm', 'karanlık mod'],
    sayfa: 'GorünumAyarlari',
    grup: 'Uygulama',
  },
  {
    id: 'sayfa-yedekleme',
    baslik: 'Yedekleme ve aktarım',
    anahtarKelimeler: ['yedek', 'dışa aktar', 'içe aktar', 'yedekleme'],
    sayfa: 'YedeklemeAktarim',
    grup: 'Veri ve destek',
  },
  {
    id: 'sayfa-tani',
    baslik: 'Tanı ve geri bildirim',
    anahtarKelimeler: ['tanı', 'sorun bildir', 'geri bildirim', 'hata'],
    sayfa: 'TaniGeriBildirim',
    grup: 'Veri ve destek',
  },
  {
    id: 'sayfa-nelerYeni',
    baslik: 'Neler yeni',
    anahtarKelimeler: ['yeni özellik', 'güncelleme', 'neler yeni'],
    sayfa: 'NelerYeni',
    grup: 'Veri ve destek',
  },
  {
    id: 'sayfa-hakkinda',
    baslik: 'Hakkında',
    anahtarKelimeler: ['hakkında', 'sürüm', 'versiyon', 'iletişim'],
    sayfa: 'Hakkinda',
    grup: 'Veri ve destek',
  },

  // ── Alt-ayar çapaları (17) — çapa→sayfa eşleşmesi kaynak koddan doğrulandı ──
  {
    id: 'konumModu',
    baslik: 'Konum modu',
    anahtarKelimeler: ['otomatik', 'manuel', 'konum modu', 'gps'],
    sayfa: 'KonumAyarlari',
    grup: 'Konum Ayarları',
    capa: 'konumModu',
  },
  {
    id: 'akilliTakip',
    baslik: 'Akıllı takip',
    anahtarKelimeler: ['akıllı takip', 'otomatik konum', 'arka plan konum'],
    sayfa: 'KonumAyarlari',
    grup: 'Konum Ayarları',
    capa: 'akilliTakip',
  },
  {
    id: 'tema',
    baslik: 'Tema',
    anahtarKelimeler: ['tema', 'açık tema', 'koyu tema', 'karanlık mod'],
    sayfa: 'GorünumAyarlari',
    grup: 'Görünüm',
    capa: 'tema',
  },
  {
    id: 'palet',
    baslik: 'Renk paleti',
    anahtarKelimeler: ['renk', 'palet', 'renk paleti'],
    sayfa: 'GorünumAyarlari',
    grup: 'Görünüm',
    capa: 'palet',
  },
  {
    id: 'vakitBildirimleri',
    baslik: 'Vakit bildirimleri',
    anahtarKelimeler: ['ezan', 'vakit bildirimi', 'namaz vakti'],
    sayfa: 'BildirimAyarlari',
    grup: 'Bildirimler',
    capa: 'vakitBildirimleri',
  },
  {
    id: 'cumaHatirlatmasi',
    baslik: 'Cuma hatırlatması',
    anahtarKelimeler: ['cuma', 'cuma namazı', 'hutbe'],
    sayfa: 'BildirimAyarlari',
    grup: 'Bildirimler',
    capa: 'cumaHatirlatmasi',
  },
  {
    id: 'vakitSayaci',
    baslik: 'Vakit sayacı',
    anahtarKelimeler: ['sayaç', 'geri sayım', 'vakit çıkıyor'],
    sayfa: 'BildirimAyarlari',
    grup: 'Bildirimler',
    capa: 'vakitSayaci',
  },
  {
    // DİKKAT: ad "seri"yi çağrıştırır ama kontrol Bildirimler'dedir
    // (SeriHedefAyarlari DEĞİL) — kaynak koddan doğrulandı.
    id: 'gunSonuBildirimi',
    baslik: 'Gün sonu bildirimi',
    anahtarKelimeler: ['gün sonu', 'imsak öncesi', 'özet bildirimi'],
    sayfa: 'BildirimAyarlari',
    grup: 'Bildirimler',
    capa: 'gunSonuBildirimi',
  },
  {
    id: 'tamGunEsigi',
    baslik: 'Tam gün eşiği',
    anahtarKelimeler: ['tam gün', 'eşik', 'kaç namaz'],
    sayfa: 'SeriHedefAyarlari',
    grup: 'Seri ve Hedefler',
    capa: 'tamGunEsigi',
  },
  {
    id: 'ozelGunModu',
    baslik: 'Özel gün modu',
    anahtarKelimeler: ['mazeret', 'özel gün', 'seri dondurma'],
    sayfa: 'SeriHedefAyarlari',
    grup: 'Seri ve Hedefler',
    capa: 'ozelGunModu',
  },
  {
    id: 'iftarSayaci',
    baslik: 'İftar sayacı',
    anahtarKelimeler: ['iftar', 'iftar sayacı', 'oruç açma'],
    sayfa: 'RamazanAyarlari',
    grup: 'Ramazan Özel',
    capa: 'iftarSayaci',
  },
  {
    id: 'sahurSayaci',
    baslik: 'Sahur sayacı',
    anahtarKelimeler: ['sahur', 'sahur sayacı', 'imsak'],
    sayfa: 'RamazanAyarlari',
    grup: 'Ramazan Özel',
    capa: 'sahurSayaci',
  },
  {
    id: 'takvimSenkron',
    baslik: 'Takvim senkronizasyonu',
    anahtarKelimeler: ['takvim', 'senkronizasyon', 'etkinlik oluştur'],
    sayfa: 'TakvimAyarlari',
    grup: 'Takvim Entegrasyonu',
    capa: 'takvimSenkron',
  },
  {
    id: 'muhafizAnaSwitch',
    baslik: 'Muhafızı aç/kapat',
    anahtarKelimeler: ['muhafız', 'aç kapat', 'ana switch'],
    sayfa: 'MuhafizAyarlari',
    grup: 'Namaz Muhafızı',
    capa: 'muhafizAnaSwitch',
  },
  {
    id: 'muhafizYogunluk',
    baslik: 'Hatırlatma yoğunluğu',
    anahtarKelimeler: ['hafif', 'normal', 'yoğun', 'sıklık', 'ısrarcı'],
    sayfa: 'MuhafizAyarlari',
    grup: 'Namaz Muhafızı',
    capa: 'muhafizYogunluk',
  },
  {
    id: 'disaAktar',
    baslik: 'Dışa aktar',
    anahtarKelimeler: ['yedek al', 'dışa aktar', 'paylaş'],
    sayfa: 'YedeklemeAktarim',
    grup: 'Yedekleme & Aktarım',
    capa: 'disaAktar',
  },
  {
    id: 'iceAktar',
    baslik: 'İçe aktar',
    anahtarKelimeler: ['geri yükle', 'içe aktar', 'yedeği yükle'],
    sayfa: 'YedeklemeAktarim',
    grup: 'Yedekleme & Aktarım',
    capa: 'iceAktar',
  },
];
