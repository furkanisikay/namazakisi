/**
 * Ayarlar aramasının tarayacağı sabit indeks.
 *
 * BİLİNÇLİ OLARAK SINIRLIDIR: her ayar burada YOKTUR, yalnız kullanıcının
 * en çok arayacağı satırlar — (a) görev bazlı sayfalar (çapasız, yalnız ilgili
 * sayfaya götürür) ve (b) alt-ayar çapaları (`capalar.ts`, `CapaId`). Sade tasarım
 * (Dalga 3): çapalar taşınan ayarın YENİ evini gösterir (ör. özel gün →
 * Hatırlatmalar, vakit sayacı → Saat ve widget). Bu listeyi "kapsamlı" sanıp genişletmeden önce
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
  // ── Sayfalar (çapasız) — sade tasarım (Dalga 3) görev bazlı düzen ──────────
  {
    id: 'sayfa-hatirlatmalar',
    baslik: 'Hatırlatmalar',
    anahtarKelimeler: ['hatırlatma', 'bildirim', 'ezan', 'uyarı', 'ne kadar hatırlatalım', 'düzey'],
    sayfa: 'Hatirlatmalar',
    grup: 'Namaz',
  },
  {
    id: 'sayfa-muhafiz',
    baslik: 'Vakit çıkmadan',
    anahtarKelimeler: [
      'muhafız',
      'namaz muhafızı',
      'vakit çıkarken',
      'vakit girer girmez',
      'kendim ayarlayayım',
      'sesli okuma',
    ],
    sayfa: 'MuhafizAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'sayfa-namazda-sessiz',
    baslik: 'Namazda sessiz',
    anahtarKelimeler: [
      'cami',
      'camideyim',
      'mescit',
      'sessiz',
      'namaz modu',
      'rahatsız etmeyin',
      'hutbe',
      'camilerim',
      'harita',
    ],
    sayfa: 'CamideyimAyarlari',
    grup: 'Namaz',
  },
  {
    id: 'sayfa-namaz-vakitleri',
    baslik: 'Namaz vakitleri',
    anahtarKelimeler: ['vakit', 'mezhep', 'hanefi', 'şafii', 'vitir'],
    sayfa: 'NamazVakitleriAyarlari',
    grup: 'Namaz',
  },
  {
    id: 'sayfa-konum',
    baslik: 'Konum',
    anahtarKelimeler: ['konum', 'şehir', 'gps', 'yer'],
    sayfa: 'KonumAyarlari',
    grup: 'Namaz vakitleri',
  },
  {
    id: 'sayfa-takvim',
    baslik: 'Vakitleri takvime ekleyin',
    anahtarKelimeler: ['takvim', 'etkinlik', 'senkronizasyon', 'takvim entegrasyonu'],
    sayfa: 'TakvimAyarlari',
    grup: 'Namaz vakitleri',
  },
  {
    id: 'sayfa-seferilik',
    baslik: 'Yolculuk bilgisi',
    anahtarKelimeler: ['yolculuk', 'seferî', 'seferi', 'misafir', 'kasr', 'cem', 'ikamet'],
    sayfa: 'SeferilikAyarlari',
    grup: 'Namaz vakitleri',
  },
  {
    id: 'sayfa-seri',
    baslik: 'Seri hedefi',
    anahtarKelimeler: ['seri', 'hedef', 'puan', 'streak'],
    sayfa: 'SeriHedefAyarlari',
    grup: 'Namaz',
  },
  {
    id: 'sayfa-ramazan',
    baslik: 'Ramazan',
    anahtarKelimeler: ['ramazan', 'iftar', 'sahur', 'oruç'],
    sayfa: 'RamazanAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'sayfa-nafile',
    baslik: 'Nafile namazlar',
    anahtarKelimeler: ['nafile', 'kuşluk', 'duha', 'işrak', 'evvabin', 'teheccüd', 'gece namazı'],
    sayfa: 'NafileAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'sayfa-gorunum',
    baslik: 'Görünüm',
    anahtarKelimeler: ['tema', 'renk', 'görünüm', 'karanlık mod'],
    sayfa: 'GorünumAyarlari',
    grup: 'Ekran ve cihazlar',
  },
  {
    id: 'sayfa-saat-widget',
    baslik: 'Saat ve widget',
    anahtarKelimeler: ['saat', 'wear', 'widget', 'now bar', 'canlı sayaç', 'canlı etkinlik', 'bileklik', 'otomasyon', 'tasker', 'rutin'],
    sayfa: 'SaatVeWidgetAyarlari',
    grup: 'Ekran ve cihazlar',
  },
  {
    id: 'sayfa-yedekleme',
    baslik: 'Yedek ve eşitleme',
    anahtarKelimeler: ['yedek', 'dışa aktar', 'içe aktar', 'yedekleme', 'eşitleme'],
    sayfa: 'YedeklemeAktarim',
    grup: 'Hesap',
  },
  {
    id: 'sayfa-yardim',
    baslik: 'Yardım',
    anahtarKelimeler: ['yardım', 'kurulum', 'sihirbaz', 'yeniden başlat'],
    sayfa: 'Yardim',
    grup: 'Hesap',
  },
  {
    id: 'sayfa-tani',
    baslik: 'Sorun bildirin',
    anahtarKelimeler: ['tanı', 'sorun bildir', 'geri bildirim', 'hata'],
    sayfa: 'TaniGeriBildirim',
    grup: 'Yardım',
  },
  {
    id: 'sayfa-nelerYeni',
    baslik: 'Neler yeni',
    anahtarKelimeler: ['yeni özellik', 'güncelleme', 'neler yeni'],
    sayfa: 'NelerYeni',
    grup: 'Yardım',
  },
  {
    id: 'sayfa-hakkinda',
    baslik: 'Hakkında',
    anahtarKelimeler: ['hakkında', 'sürüm', 'versiyon', 'iletişim'],
    sayfa: 'Hakkinda',
    grup: 'Yardım',
  },

  // ── Alt-ayar çapaları — çapa→sayfa eşleşmesi kaynak koddan doğrulandı ──────
  {
    id: 'konumModu',
    baslik: 'Konum modu',
    anahtarKelimeler: ['otomatik', 'manuel', 'konum modu', 'gps'],
    sayfa: 'KonumAyarlari',
    grup: 'Konum',
    capa: 'konumModu',
  },
  {
    id: 'akilliTakip',
    baslik: 'Akıllı takip',
    anahtarKelimeler: ['akıllı takip', 'otomatik konum', 'arka plan konum'],
    sayfa: 'KonumAyarlari',
    grup: 'Konum',
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
    id: 'sadeGorunum',
    baslik: 'Sade görünüm',
    anahtarKelimeler: ['sade', 'sade görünüm', 'büyük yazı', 'yaşlı', 'basit', 'kolay görünüm', 'sesli okuma'],
    sayfa: 'GorünumAyarlari',
    grup: 'Görünüm',
    capa: 'sadeGorunum',
  },
  {
    id: 'vakitBildirimleri',
    baslik: 'Vakit girince',
    anahtarKelimeler: ['ezan', 'vakit bildirimi', 'namaz vakti', 'vakit girdi'],
    sayfa: 'VakitGirinceAyarlari',
    grup: 'Hatırlatmalar',
    capa: 'vakitBildirimleri',
  },
  {
    id: 'cumaHatirlatmasi',
    baslik: 'Cuma namazı',
    anahtarKelimeler: ['cuma', 'cuma namazı', 'hutbe'],
    sayfa: 'CumaHatirlatmaAyarlari',
    grup: 'Hatırlatmalar',
    capa: 'cumaHatirlatmasi',
  },
  {
    id: 'yatisHatirlatmasi',
    baslik: 'Yatmadan önce',
    anahtarKelimeler: ['yatış', 'uyku', 'yatsı', 'gün sonu muhasebesi', 'kaza'],
    sayfa: 'YatisHatirlatmaAyarlari',
    grup: 'Hatırlatmalar',
    capa: 'yatisHatirlatmasi',
  },
  {
    id: 'camiyeGitHatirlatmasi',
    baslik: 'Camiye gitme vakti',
    anahtarKelimeler: ['cami', 'camiye git', 'yürüme', 'cemaat', 'ezandan önce', 'camide kılacağım'],
    sayfa: 'CamiyeGitAyarlari',
    grup: 'Hatırlatmalar',
    capa: 'camiyeGitHatirlatmasi',
  },
  {
    id: 'takvimCakismaUyarisi',
    baslik: 'Toplantı çakışırsa',
    anahtarKelimeler: ['takvim', 'toplantı', 'etkinlik', 'çakışma', 'ajanda'],
    sayfa: 'TakvimCakismaAyarlari',
    grup: 'Hatırlatmalar',
    capa: 'takvimCakismaUyarisi',
  },
  {
    id: 'vakitSayaci',
    baslik: 'Vakit sayacı',
    anahtarKelimeler: ['sayaç', 'geri sayım', 'vakit çıkıyor'],
    sayfa: 'SaatVeWidgetAyarlari',
    grup: 'Saat ve widget',
    capa: 'vakitSayaci',
  },
  {
    // DİKKAT: ad "seri"yi çağrıştırır ama kontrol Hatırlatmalar'dadır (Dalga 3).
    id: 'gunSonuBildirimi',
    baslik: 'Günü tamamlamadıysam',
    anahtarKelimeler: ['gün sonu', 'imsak öncesi', 'seri hatırlatma'],
    sayfa: 'GunSonuAyarlari',
    grup: 'Hatırlatmalar',
    capa: 'gunSonuBildirimi',
  },
  {
    id: 'tamGunEsigi',
    baslik: 'Tam gün eşiği',
    anahtarKelimeler: ['tam gün', 'eşik', 'kaç namaz'],
    sayfa: 'SeriHedefAyarlari',
    grup: 'Seri hedefi',
    capa: 'tamGunEsigi',
  },
  {
    id: 'ozelGunModu',
    baslik: 'Özel gün',
    anahtarKelimeler: ['mazeret', 'özel gün', 'seri dondurma', 'hayız', 'hatırlatmaları durdur'],
    sayfa: 'OzelGunAyarlari',
    grup: 'Hatırlatmalar',
    capa: 'ozelGunModu',
  },
  {
    id: 'iftarSayaci',
    baslik: 'İftar sayacı',
    anahtarKelimeler: ['iftar', 'iftar sayacı', 'oruç açma'],
    sayfa: 'RamazanAyarlari',
    grup: 'Ramazan',
    capa: 'iftarSayaci',
  },
  {
    id: 'sahurSayaci',
    baslik: 'Sahur sayacı',
    anahtarKelimeler: ['sahur', 'sahur sayacı', 'imsak'],
    sayfa: 'RamazanAyarlari',
    grup: 'Ramazan',
    capa: 'sahurSayaci',
  },
  {
    id: 'takvimSenkron',
    baslik: 'Takvim senkronizasyonu',
    anahtarKelimeler: ['takvim', 'senkronizasyon', 'etkinlik oluştur'],
    sayfa: 'TakvimAyarlari',
    grup: 'Namaz vakitleri',
    capa: 'takvimSenkron',
  },
  {
    id: 'muhafizAnaSwitch',
    baslik: 'Vakit çıkmadan hatırlatma',
    anahtarKelimeler: ['muhafız', 'aç kapat', 'vakit çıkmadan'],
    sayfa: 'Hatirlatmalar',
    grup: 'Hatırlatmalar',
    capa: 'muhafizAnaSwitch',
  },
  {
    id: 'muhafizYogunluk',
    baslik: 'Hatırlatma düzeyi',
    anahtarKelimeler: ['hafif', 'normal', 'yoğun', 'sıklık', 'ısrarcı', 'düzey', 'yoğunluk'],
    sayfa: 'Hatirlatmalar',
    grup: 'Hatırlatmalar',
    capa: 'muhafizYogunluk',
  },
  {
    id: 'disaAktar',
    baslik: 'Dışa aktar',
    anahtarKelimeler: ['yedek al', 'dışa aktar', 'paylaş'],
    sayfa: 'YedeklemeAktarim',
    grup: 'Yedek ve eşitleme',
    capa: 'disaAktar',
  },
  {
    id: 'iceAktar',
    baslik: 'İçe aktar',
    anahtarKelimeler: ['geri yükle', 'içe aktar', 'yedeği yükle'],
    sayfa: 'YedeklemeAktarim',
    grup: 'Yedek ve eşitleme',
    capa: 'iceAktar',
  },
];
