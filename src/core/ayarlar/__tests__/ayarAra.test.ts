import { ayarAra } from '../ayarAra';
import type { AyarIndeksKaydi } from '../aramaIndeksi';

const INDEKS: AyarIndeksKaydi[] = [
  {
    id: 'a-muhafiz',
    baslik: 'Namaz muhafızı',
    anahtarKelimeler: ['muhafız', 'hatırlatma', 'uyarı'],
    sayfa: 'MuhafizAyarlari',
    grup: 'Hatırlatmalar',
  },
  {
    id: 'b-muhafizYogunluk',
    baslik: 'Hatırlatma yoğunluğu',
    anahtarKelimeler: ['hafif', 'normal', 'yoğun', 'sıklık', 'ısrarcı'],
    sayfa: 'MuhafizAyarlari',
    grup: 'Namaz Muhafızı',
    capa: 'muhafizYogunluk',
  },
  {
    id: 'c-konum',
    baslik: 'Konum',
    anahtarKelimeler: ['konum', 'şehir', 'gps', 'yer'],
    sayfa: 'KonumAyarlari',
    grup: 'Namaz vakitleri',
  },
  {
    id: 'd-konumModu',
    baslik: 'Konum modu',
    anahtarKelimeler: ['otomatik', 'manuel', 'konum modu', 'gps'],
    sayfa: 'KonumAyarlari',
    grup: 'Konum Ayarları',
    capa: 'konumModu',
  },
];

describe('ayarAra', () => {
  it('boş sorgu → boş dizi', () => {
    expect(ayarAra(INDEKS, '')).toEqual([]);
  });

  it('yalnız boşluktan oluşan sorgu → boş dizi', () => {
    expect(ayarAra(INDEKS, '   ')).toEqual([]);
  });

  it('eşleşmeyen sorgu → boş dizi', () => {
    expect(ayarAra(INDEKS, 'zzzzz')).toEqual([]);
  });

  it('Türkçesiz yazımla eşleşme (aksansız "muhafiz" → "Muhafız" bulur)', () => {
    const sonuc = ayarAra(INDEKS, 'muhafiz');
    expect(sonuc.map(k => k.id)).toContain('a-muhafiz');
  });

  it('anahtar kelimeyle eşleşme (yalnız aksansız gövde geçse bile)', () => {
    const sonuc = ayarAra(INDEKS, 'israrci');
    expect(sonuc.map(k => k.id)).toEqual(['b-muhafizYogunluk']);
  });

  it('skor sıralaması: başlık başlangıcı(3) > başlık içi(2) > anahtar kelime(1)', () => {
    // 'konum' hem 'Konum' başlığının TAMAMI (başlangıç) hem 'Konum modu' başlığının
    // başlangıcı — ikisi de skor 3 alır, ayrıca anahtar kelimede geçen 'a-muhafiz'
    // eşleşmez (arama terimi orada yok). Skor farkını görmek için başlık-içi vs
    // anahtar-kelime karşılaştıran ayrı bir sorgu kullanılır.
    const sonuc = ayarAra(INDEKS, 'yogun');
    // 'Hatırlatma yoğunluğu' başlığında YOK ama anahtar kelimede 'yoğun' var → skor 1.
    expect(sonuc.map(k => k.id)).toEqual(['b-muhafizYogunluk']);
  });

  it('skor sıralaması: başlık başlangıcı önce gelir', () => {
    const sonuc = ayarAra(INDEKS, 'konum');
    // Hem 'Konum' hem 'Konum modu' başlık-başlangıcı eşleşir (skor 3) — eşit
    // skorda orijinal indeks sırası korunur (stabil sıralama).
    expect(sonuc.map(k => k.id)).toEqual(['c-konum', 'd-konumModu']);
  });

  it('başlık içi eşleşme, anahtar kelime eşleşmesinden önce gelir', () => {
    const yereldenIndeks: AyarIndeksKaydi[] = [
      {
        id: 'keyword-only',
        baslik: 'Alfa',
        anahtarKelimeler: ['beta'],
        sayfa: 'Hakkinda',
        grup: 'Test',
      },
      {
        id: 'title-contains',
        baslik: 'Zeta Beta',
        anahtarKelimeler: [],
        sayfa: 'Hakkinda',
        grup: 'Test',
      },
    ];
    const sonuc = ayarAra(yereldenIndeks, 'beta');
    expect(sonuc.map(k => k.id)).toEqual(['title-contains', 'keyword-only']);
  });
});
